import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { IUser } from 'src/modules/user.decorator';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { Disclosure } from './disclosure.entity';
import {
  DisclosureDto,
  FilterDisclosureDto,
  UpdateDisclosureDto,
} from './disclosure.dto';
import { User } from '../user/entities/user.entity';
import { Datacube } from '../datacubes/datacube.entity';

@Injectable()
export class DisclosureService {
  private readonly disclosureModel: Repository<Disclosure>;

  private readonly connection: DataSource;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.connection = connection;
    this.disclosureModel = connection.getRepository(Disclosure);
  }

  async getAllDisclosures(params: any) {
    const { limit, skip, sort, page, filter } = params;
    const whereConditions: any = {
      is_deleted: filter.is_deleted !== undefined ? filter.is_deleted : false,
    };
    const query = this.disclosureModel.createQueryBuilder('disclosure');
    query.where(whereConditions);
    query.leftJoinAndSelect('disclosure.datacube', 'datacube');
    query.leftJoinAndSelect('disclosure.submitted_by', 'submitted_by');

    // Handle sort parameter - it can be either a string or an object from QUERY_PARAMS
    let sortField = 'createdAt';
    let sortDirection: 'ASC' | 'DESC' = 'DESC';

    if (typeof sort === 'string') {
      sortField = sort;
      sortDirection = sort === 'createdAt' ? 'DESC' : 'ASC';
    } else if (typeof sort === 'object' && sort !== null) {
      // Extract the field name from the sort object
      const sortKeys = Object.keys(sort);
      if (sortKeys.length > 0) {
        sortField = sortKeys[0];
        sortDirection = sort[sortField] === -1 ? 'DESC' : 'ASC';
      }
    }

    query.orderBy(`disclosure.${sortField}`, sortDirection);
    const [disclosures, totalCount] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return {
      success: true,
      disclosure: disclosures,
      meta: {
        currentCount: disclosures.length,
        currentPage: page,
        currentLimit: limit,
        totalCount,
      },
    };
  }

  async getDisclosure(id: string) {
    const connection = await this.connection.createQueryRunner();
    await connection.startTransaction();

    try {
      const disclosure = await connection.manager
        .getRepository(Disclosure)
        .findOne({
          where: { id },
          relations: ['submitted_by', 'datacube'],
          select: {
            submitted_by: {
              id: true,
              name: true,
            },
            datacube: {
              id: true,
              name: true,
            },
          },
        });
      if (!disclosure) {
        throw new NotFoundException('Disclosure not found');
      }
      return {
        success: true,
        disclosure,
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw error;
    } finally {
      await connection.release();
    }
  }

  async createDisclosure(params: DisclosureDto, user: IUser) {
    const connection = await this.connection.createQueryRunner();
    await connection.startTransaction();

    try {
      const userData = await connection.manager
        .getRepository(User)
        .findOne({ where: { id: user.id } });

      if (!userData) {
        throw new BadRequestException('User not found');
      }
      const disclosureData = await connection.manager
        .getRepository(Disclosure)
        .findOne({
          where: { name: params.name, datacube: { id: params.datacube_id } },
        });

      if (disclosureData) {
        throw new BadRequestException('Disclosure already exists');
      }

      const disclosure = await connection.manager
        .getRepository(Disclosure)
        .create({
          ...params,
          datacube: { id: params.datacube_id },
          submitted_by: userData.id,
          createdAt: new Date(),
        } as unknown as Disclosure);

      await connection.manager.getRepository(Disclosure).save(disclosure);
      await connection.commitTransaction();
      return {
        success: true,
        message: 'Disclosure created successfully',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw error;
    } finally {
      await connection.release();
    }
  }

  async getDisclosureByName(name: string, params: any) {
    try {
      const { limit, skip, sort, page, filter } = params;
      const whereConditions: any = {
        is_deleted: filter.is_deleted !== undefined ? filter.is_deleted : false,
      };

      const query = this.disclosureModel.createQueryBuilder('disclosure');
      query.where(whereConditions);
      query.andWhere('disclosure.name = :name', { name });
      query.leftJoinAndSelect('disclosure.submitted_by', 'submitted_by');
      query.leftJoinAndSelect('disclosure.datacube', 'datacube');
      query.orderBy('disclosure.createdAt', 'DESC');
      query.skip(skip).take(limit);

      const [disclosures, totalCount] = await query.getManyAndCount();
      if (disclosures.length === 0) {
        throw new BadRequestException('Disclosure not found');
      }
      return {
        success: true,
        disclosure: disclosures,
        meta: {
          currentCount: disclosures.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getDisclosureByNameAndDatacube(
    name: string,
    datacube_id: string,
    params: any,
  ) {
    try {
      const { limit, skip, sort, page, filter } = params;
      const whereConditions: any = {
        is_deleted: filter.is_deleted !== undefined ? filter.is_deleted : false,
      };

      const query = this.disclosureModel.createQueryBuilder('disclosure');
      query.where(whereConditions);
      query.andWhere('disclosure.name = :name', { name });
      query.andWhere('disclosure.datacube_id = :datacube_id', { datacube_id });
      query.leftJoinAndSelect('disclosure.submitted_by', 'submitted_by');
      query.leftJoinAndSelect('disclosure.datacube', 'datacube');
      query.orderBy('disclosure.createdAt', 'DESC');
      query.skip(skip).take(limit);

      const [disclosures, totalCount] = await query.getManyAndCount();
      if (disclosures.length === 0) {
        throw new BadRequestException('Disclosure not found');
      }
      return {
        success: true,
        disclosure: disclosures,
        meta: {
          currentCount: disclosures.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getDisclosureByDatacube(datacube_id: string, params: any) {
    try {
      const { limit, skip, sort, page, filter } = params;

      const disclosures = await this.disclosureModel.find({
        where: {
          datacube: {
            id: datacube_id,
          },
        },
        relations: ['datacube', 'submitted_by'],
        order: {
          createdAt: 'DESC',
        },
      });

      const totalCount = disclosures.length;
      return {
        success: true,
        disclosure: disclosures,
        meta: {
          currentCount: disclosures.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateDisclosure(id: string, params: UpdateDisclosureDto) {
    const connection = await this.connection.createQueryRunner();
    await connection.startTransaction();

    try {
      const disclosure = await connection.manager
        .getRepository(Disclosure)
        .findOne({ where: { id }, relations: ['datacube'] });

      if (!disclosure) {
        throw new BadRequestException('Disclosure not found');
      }

      // Extract datacube_id from params and remove it from the update object
      const { datacube_id, ...updateParams } = params;

      // Prepare the update object without datacube_id
      const updateData: any = {
        ...updateParams,
        updatedAt: new Date(),
      };

      // Update the disclosure
      await connection.manager.getRepository(Disclosure).update(id, updateData);

      // If datacube_id is provided, update the relation separately
      if (datacube_id) {
        await connection.manager.getRepository(Disclosure).update(id, {
          datacube: { id: datacube_id },
        });
      }

      await connection.commitTransaction();
      return {
        success: true,
        message: 'Disclosure updated successfully',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await connection.release();
    }
  }

  async deleteDisclosure(id: string) {
    const connection = await this.connection.createQueryRunner();
    await connection.startTransaction();

    try {
      const disclosure = await connection.manager
        .getRepository(Disclosure)
        .findOne({ where: { id } });

      if (!disclosure) {
        throw new BadRequestException('Disclosure not found');
      }

      await connection.manager.getRepository(Disclosure).delete(id);
      await connection.commitTransaction();
      return {
        success: true,
        message: 'Disclosure deleted successfully',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await connection.release();
    }
  }

  async getDisclosureReport(datacube_id: string) {
    const connection = await this.connection.createQueryRunner();
    await connection.startTransaction();

    try {
      const disclosures = await connection.manager
        .getRepository(Disclosure)
        .find({
          where: { datacube: { id: datacube_id } },
          relations: ['datacube'],
        });

      const data = disclosures.map((disclosure) => {
        const flattenedData = {
          id: disclosure.id,
          name: disclosure.name,
          datacube: disclosure.datacube.name,
        };

        if (disclosure.indicators) {
          disclosure.indicators.forEach((indicator) => {
            indicator.questions.forEach((question) => {
              if (question.groups) {
                question.groups.forEach((group) => {
                  group.forEach((q) => {
                    // Check if question_title exists before processing
                    if (q.question_title) {
                      // Remove special characters and spaces, convert to camelCase
                      const key = q.question_title
                        .replace(/[^a-zA-Z0-9\s]/g, '')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .split(' ')
                        .map((word, index) =>
                          index === 0
                            ? word.charAt(0).toLowerCase() +
                              word.slice(1).toLowerCase()
                            : word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase(),
                        )
                        .join('');
                      flattenedData[key] = q.answer;
                    }
                  });
                });
              } else {
                // Check if question_title exists before processing
                if (question.question_title) {
                  // Remove special characters and spaces, convert to camelCase
                  const key = question.question_title
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .split(' ')
                    .map((word, index) =>
                      index === 0
                        ? word.charAt(0).toLowerCase() +
                          word.slice(1).toLowerCase()
                        : word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                    )
                    .join('');
                  flattenedData[key] = question.answer;
                }
              }
            });
          });
        }

        return flattenedData;
      });
      return {
        success: true,
        data,
        // disclosures,
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await connection.release();
    }
  }
}
