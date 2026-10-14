import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto, CreateOptionCodeDto } from './dto/sales.dto';
import { Category } from './entities/category.entity';
import { OptionCode } from './entities/option-code.entity';

@Injectable()
export class SalesService {
  constructor(@Inject(CONNECTION) private readonly connection: DataSource) {}

  private get categoryRepo(): Repository<Category> {
    if (!this.connection) {
      throw new BadRequestException('Tenant connection not found');
    }
    return this.connection.getRepository(Category);
  }

  private get optionRepo(): Repository<OptionCode> {
    if (!this.connection) {
      throw new BadRequestException('Tenant connection not found');
    }
    return this.connection.getRepository(OptionCode);
  }

  async seedDefaultsIfEmpty() {
    const count = await this.categoryRepo.count();
    if (count > 0) return;

    // Seed initial categories & option codes from design
    const brand = await this.categoryRepo.save({
      name: 'Brand',
      code: 'brand',
      description: 'The manufacturing brand or series',
      parent_branch: null,
    });

    await this.optionRepo.save([
      { category_id: brand.id, name: 'EZFly', code: 'EZF' },
      { category_id: brand.id, name: 'Ajeet Mini Hawk', code: 'AMH' },
      { category_id: brand.id, name: 'Ajeet Mini Shikra', code: 'AMS' },
      { category_id: brand.id, name: 'Ajeet Eagle', code: 'AEB' },
      { category_id: brand.id, name: 'Navgati', code: 'NGT' },
      { category_id: brand.id, name: 'Navgati - Lite', code: 'NGL' },
    ]);

    const app = await this.categoryRepo.save({
      name: 'Application',
      code: 'application',
      description: 'Primary deployment scenario',
      parent_branch: null,
    });

    await this.optionRepo.save([
      { category_id: app.id, name: 'Surveillance', code: 'SRV' },
      { category_id: app.id, name: 'Delivery', code: 'DLV' },
      { category_id: app.id, name: 'Inspection', code: 'ISP' },
      { category_id: app.id, name: 'Mapping', code: 'MAP' },
    ]);

    await this.categoryRepo.save({
      name: 'Platform',
      code: 'platform',
      description: 'Core airframe and platform model',
      parent_branch: 'Core Platform (Core)',
    });
  }

  async findAllCategories() {
    await this.seedDefaultsIfEmpty();
    const categories = await this.categoryRepo.find({
      relations: ['options'],
      order: { created_at: 'ASC' },
    });

    return categories.map((cat) => ({
      ...cat,
      optionsCount: cat.options?.length || 0,
    }));
  }

  async findCategoryById(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    const code =
      dto.code?.trim().toLowerCase() ||
      dto.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');

    const newCategory = this.categoryRepo.create({
      name: dto.name.trim(),
      code,
      description: dto.description?.trim() || null,
      parent_branch: dto.parentBranch?.trim() || null,
    });

    return await this.categoryRepo.save(newCategory);
  }

  async deleteCategory(id: string) {
    const category = await this.findCategoryById(id);
    await this.categoryRepo.remove(category);
    return { success: true, message: 'Category deleted successfully' };
  }

  async getCategoryOptions(categoryId: string) {
    await this.findCategoryById(categoryId);
    return await this.optionRepo.find({
      where: { category_id: categoryId },
      order: { created_at: 'ASC' },
    });
  }

  async createOptionCode(categoryId: string, dto: CreateOptionCodeDto) {
    const category = await this.findCategoryById(categoryId);

    const exists = await this.optionRepo.findOne({
      where: {
        category_id: category.id,
        code: dto.code.trim().toUpperCase(),
      },
    });

    if (exists) {
      throw new BadRequestException(
        `Option code "${dto.code.trim().toUpperCase()}" already exists in this category`,
      );
    }

    const newOption = this.optionRepo.create({
      category_id: category.id,
      name: dto.name.trim(),
      code: dto.code.trim().toUpperCase(),
    });

    return await this.optionRepo.save(newOption);
  }

  async deleteOptionCode(optionId: string) {
    const option = await this.optionRepo.findOne({ where: { id: optionId } });
    if (!option) {
      throw new NotFoundException(`Option code with ID ${optionId} not found`);
    }
    await this.optionRepo.remove(option);
    return { success: true, message: 'Option code deleted successfully' };
  }
}
