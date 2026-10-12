import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.repository';
import { Standard } from '../standard.entity';
import {
  buildStandardRelations,
  _buildStandardRelations,
} from '../constants/standard.constants';

@Injectable()
export class StandardRepository extends BaseRepository<Standard> {
  constructor(
    @InjectRepository(Standard)
    repository: Repository<Standard>,
  ) {
    super(repository);
  }

  async findByIdWithRelations(id: string): Promise<Standard | null> {
    const queryBuilder = this.repository.createQueryBuilder('standard');
    const standardWithRelations = buildStandardRelations(queryBuilder, id);
    return await standardWithRelations.getOne();
  }

  async findAllWithRelations(params: {
    where?: any;
    order?: any;
    skip?: number;
    take?: number;
  }): Promise<[Standard[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('standard');
    const standardWithRelations = _buildStandardRelations(queryBuilder);
    if (params.where) {
      standardWithRelations.where(params.where);
    }

    if (params.order) {
      Object.entries(params.order).forEach(([key, value]) => {
        const direction = value === 1 ? 'ASC' : 'DESC';
        standardWithRelations.orderBy(`standard.${key}`, direction);
      });
    }

    if (params.skip !== undefined) {
      standardWithRelations.skip(params.skip);
    }

    if (params.take !== undefined) {
      standardWithRelations.take(params.take);
    }

    return await standardWithRelations.getManyAndCount();
  }
}
