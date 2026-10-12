import { BadRequestException, Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Like, Repository } from 'typeorm';
import { CreateDepartmentDto } from './department.dto';
import { Department } from './department.entity';
import { Question } from '../questions/question.entity';

interface DepartmentFilterParams {
  is_deleted?: boolean;
  search?: string;
  limit?: string;
  page?: string;
  sort?: any;
  filter?: any;
}

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentModel: Repository<Department>,
    private readonly dataSource: DataSource,
    @InjectRepository(Question)
    private readonly questionModel: Repository<Question>,
  ) {}

  async getAll(name: string) {
    return await this.departmentModel.findOne({
      where: { name, is_deleted: false },
      relations: ['module'],
    });
  }

  async createDepartment(body: CreateDepartmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingDepartment = await this.departmentModel.findOne({
        where: { name: body.name },
      });
      if (existingDepartment) {
        throw new BadRequestException('Department already exists');
      }
      const department = this.departmentModel.create(body);
      await this.departmentModel.save(department);
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Department created successfully',
        data: department,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllDepartments(@Query() params: any) {
    try {
      const { limit, skip, sort, page, filter, is_deleted } = params;
      const whereConditions: any = {
        is_deleted: is_deleted !== undefined ? is_deleted : false,
      };

      const query: any = {
        take: limit,
        skip,
        order: sort,
        where: whereConditions,
        relations: ['questions', 'questions.sub_indicator'],
      };

      if (filter?.search) {
        query.where = {
          ...query.where,
          name: ILike(`%${filter.search}%`),
        };
      }

      // Handle sort order
      if (sort && sort.startsWith('-')) {
        // Remove the minus sign and set descending order
        const sortField = sort.substring(1);
        query.order = { [sortField]: 'DESC' };
      } else if (sort) {
        // Set ascending order
        query.order = { [sort]: 'ASC' };
      }

      // Calculate skip based on page and limit
      if (page && limit) {
        query.skip = (Number(page) - 1) * Number(limit);
        query.take = Number(limit);
      }
      const [departments, total] =
        await this.departmentModel.findAndCount(query);

      return {
        success: true,
        departments,
        meta: {
          currentCount: departments.length,
          currentPage: Number(page),
          currentLimit: Number(limit),
          totalCount: total,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getDepartmentById(id: string) {
    try {
      const department = await this.departmentModel.findOne({
        where: { id, is_deleted: false },
        relations: ['questions'],
      });

      if (!department || department.is_deleted === true) {
        throw new BadRequestException('Department not found');
      }

      return {
        success: true,
        data: department,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateDepartment(id: string, body: CreateDepartmentDto) {
    try {
      const department = await this.departmentModel.findOne({
        where: { id, is_deleted: false },
      });

      if (!department) {
        throw new BadRequestException('Department not found');
      }

      const updatedDepartment = this.departmentModel.merge(department, body);
      await this.departmentModel.save(updatedDepartment);

      return {
        success: true,
        message: 'Department updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteDepartment(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const department = await this.departmentModel.findOne({
        where: { id, is_deleted: false },
      });

      if (!department) {
        throw new BadRequestException('Department not found');
      }

      department.is_deleted = true;
      await this.departmentModel.save(department);
      await queryRunner.commitTransaction();

      await queryRunner.manager.update(
        Question,
        { department_id: id },
        { department: null },
      );

      return {
        success: true,
        message: 'Department deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
