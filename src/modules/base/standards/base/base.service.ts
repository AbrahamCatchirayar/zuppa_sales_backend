import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export abstract class BaseService {
  constructor(protected readonly dataSource: DataSource) {}

  protected async executeInTransaction<T>(
    operation: (queryRunner: any) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || error);
    } finally {
      await queryRunner.release();
    }
  }

  protected validateIds(ids: string[], fieldNames: string[]): void {
    ids.forEach((id, index) => {
      if (!id) {
        throw new BadRequestException(`${fieldNames[index]} is required`);
      }
    });
  }

  protected validateEntityExists(
    entity: any,
    id: string,
    entityName: string,
  ): void {
    if (!entity) {
      throw new BadRequestException(`${entityName} with ID ${id} not found`);
    }
  }
}
