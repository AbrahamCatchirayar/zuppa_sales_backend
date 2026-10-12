/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  FindOptionsWhere,
  Repository,
  DeepPartial,
  UpdateResult,
} from 'typeorm';
import { Standard } from '../standard.entity';
import { STANDARD_RELATIONS } from '../constants/standard.constants';

export abstract class BaseRepository<T extends Standard> {
  constructor(protected readonly repository: Repository<Standard>) {}

  async findById(
    id: string,
    relations: string[] = STANDARD_RELATIONS,
  ): Promise<Standard | null> {
    return await this.repository.findOne({
      where: { id, is_deleted: false } as FindOptionsWhere<T>,
      relations,
    });
  }

  async findByName(
    name: string,
    relations: string[] = STANDARD_RELATIONS,
  ): Promise<Standard | null> {
    return this.repository.findOne({
      where: { name, is_deleted: false } as unknown as FindOptionsWhere<T>,
      relations,
    });
  }

  async findAll(params: {
    where?: FindOptionsWhere<Standard>;
    relations?: string[];
    order?: any;
    skip?: number;
    take?: number;
  }): Promise<[Standard[], number]> {
    return this.repository.findAndCount({
      where: params.where,
      relations: params.relations,
      order: params.order,
      skip: params.skip,
      take: params.take,
    });
  }

  async create(entity: DeepPartial<Standard>): Promise<Standard> {
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: string, entity: Partial<Standard>): Promise<UpdateResult> {
    return this.repository.update(id, entity as any);
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.repository.update(id, {
      is_deleted: true,
      deleted_at: new Date(),
    } as any);
  }
}
