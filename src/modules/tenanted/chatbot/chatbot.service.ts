import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatbotDto } from './chatbot.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  private currentWebpageContext = '';

  private genAI: GoogleGenerativeAI;

  private geminiModelName = 'gemini-2.5-flash';
  // private geminiModelName = 'gemini-1.5-flash-latest';

  private readonly systemInstruction: string = `You are an expert AI named THAMBI. Your primary roles are to rephrase text and provide insights based on given content. When rephrasing text, provide the rephrased options directly without adding headings like "Rephrased Content" or "Key Insights". When asked for insights or summaries, especially if the user's query implicitly or explicitly relates to a previously provided webpage context, use that context to formulate your answer, but only when it is asked. NOT EVERYTIME. Be clear, accurate, concise, and helpful. Keep rephrased text simple, like: 'the books are found to be in library'.`;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_GEMINI_API');
    if (!apiKey) {
      this.logger.error('GOOGLE_GEMINI_API environment variable is not set!');
      throw new Error('GOOGLE_GEMINI_API is not configured.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async convertMarkdownToHtml(mdText: string): Promise<string> {
    if (!mdText) {
      return '';
    }
    try {
      const { marked } = require('marked');
      return marked.parse(mdText);
    } catch (error) {
      this.logger.error('Error importing marked:', error);
      // Fallback: return the markdown text as-is if parsing fails
      return mdText;
    }
  }

  private ensureBasicMarkdownStructure(textContent: string): string {
    if (!textContent) {
      return '# No Content Provided';
    }

    const normalizedText = textContent.trim();
    // Don't add structure if content already has it
    if (/^#{1,6}\s/m.test(normalizedText)) {
      return normalizedText;
    }
    // Return as-is without adding heading
    return normalizedText;
  }

  async handleAiRequest(data: ChatbotDto): Promise<{
    text: string;
  }> {
    const userPrompt = (data.text || '').trim();
    const incomingWebpageContent = (data.webpageContent || '').trim();

    if (!userPrompt) {
      throw new Error('No user prompt provided.');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.geminiModelName,
      });

      let combinedQuery = `User's request: '${userPrompt}'`;

      if (
        incomingWebpageContent &&
        incomingWebpageContent !== 'analyticsrephrase'
      ) {
        combinedQuery += `\n\n--- Webpage Context ---\n${incomingWebpageContent}\n--- End Webpage Context ---`;
        combinedQuery +=
          "\n\nGiven the user's request and the provided webpage context, please provide your response. Use the webpage context only if it's relevant to the user's query. IMPORTANT: Do NOT add ANY headings (no 'Rephrased Content', 'Key Insights', 'Insight', etc.). When providing rephrasing options, use sub-headings like '## Option 1', '## Option 2' ONLY. When providing insights or analysis, write directly in paragraphs WITHOUT any heading. Start your response immediately with the content.";
      } else if (incomingWebpageContent === 'analyticsrephrase') {
        combinedQuery +=
          "\n\nPlease rephrase the user's request into ONE concise natural language sentence. Do not add formatting, headings, options, or explanations. Return only the rephrased sentence as plain text.";
      } else {
        combinedQuery +=
          "\n\nGiven the user's request, please provide your response. IMPORTANT: Do NOT add ANY headings (no 'Rephrased Content', 'Key Insights', 'Insight', etc.). When providing rephrasing options, use sub-headings like '## Option 1', '## Option 2' ONLY. When providing insights or analysis, write directly in paragraphs WITHOUT any heading. Start your response immediately with the content.";
      }

      const chat = model.startChat({
        history: [],
        systemInstruction: {
          role: 'system',
          parts: [{ text: this.systemInstruction }],
        },
      });

      const result = await chat.sendMessage(combinedQuery);
      const responseText = result.response.text();

      if (incomingWebpageContent === 'analyticsrephrase') {
        return { text: responseText.trim() }; // only plain value
      }

      const markdownOutput = this.ensureBasicMarkdownStructure(responseText);
      const htmlResponseText = await this.convertMarkdownToHtml(markdownOutput);

      return { text: htmlResponseText };
    } catch (e) {
      this.logger.error(`Error during AI interaction: ${e.message}`, e.stack);
      throw new InternalServerErrorException(
        `Error processing your request: ${e.message}`,
      );
    }
  }
}
