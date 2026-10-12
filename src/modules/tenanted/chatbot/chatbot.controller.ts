import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { ChatbotService } from './chatbot.service';
import { ChatbotDto } from './chatbot.dto';

@ApiTags('CHATBOT')
@Controller('v1/chatbot')
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class ChatbotController {
  private readonly logger = new Logger(ChatbotController.name);

  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('/rephrase')
  async rephrase(@Body() body: ChatbotDto, @Res() res: Response) {
    if (body === null || typeof body !== 'object') {
      // Return 400 Bad Request if no data or invalid data format
      throw new BadRequestException(
        'No input provided or invalid data format.',
      );
    }

    // Default case for 'rephrase' or if 'type' is not 'webpage_context'
    if (!body.text || body.text.trim() === '') {
      throw new BadRequestException('No user prompt provided.');
    }

    try {
      const result = await this.chatbotService.handleAiRequest(body);
      // NestJS automatically sends JSON for returned objects
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(`Controller error: ${error.message}`, error.stack);
      // The service throws exceptions which NestJS's HTTP layer can catch
      // For more specific error handling, you'd use NestJS's Exception Filters
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        text: `Error processing your request: ${error.message}`,
      });
    }
  }
}
