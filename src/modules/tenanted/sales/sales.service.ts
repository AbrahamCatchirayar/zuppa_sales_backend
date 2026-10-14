import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { DataSource, Repository } from 'typeorm';
import {
  CreateCategoryDto,
  CreateConfiguredProductDto,
  CreateOptionCodeDto,
} from './dto/sales.dto';
import { Category } from './entities/category.entity';
import { ConfiguredProduct } from './entities/configured-product.entity';
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

  private get configuredProductRepo(): Repository<ConfiguredProduct> {
    if (!this.connection) {
      throw new BadRequestException('Tenant connection not found');
    }
    return this.connection.getRepository(ConfiguredProduct);
  }

  async seedDefaultsIfEmpty() {
    const count = await this.categoryRepo.count();
    if (count > 0) return;

    const categories = [
      {
        name: 'Brand',
        code: 'brand',
        description: 'The manufacturing brand or series',
        parent_branch: null,
        options: [
          { name: 'EZFly', code: 'EZF' },
          { name: 'Ajeet Mini Hawk', code: 'AMH' },
          { name: 'Ajeet Mini Shikra', code: 'AMS' },
          { name: 'Ajeet Eagle', code: 'AEB' },
          { name: 'Navgati', code: 'NGT' },
          { name: 'Navgati - Lite', code: 'NGL' },
        ],
      },
      {
        name: 'Application',
        code: 'application',
        description: 'Primary deployment scenario',
        parent_branch: null,
        options: [
          { name: 'Surveillance', code: 'SRV' },
          { name: 'Delivery', code: 'DLV' },
          { name: 'Inspection', code: 'ISP' },
          { name: 'Mapping', code: 'MAP' },
        ],
      },
      {
        name: 'Platform',
        code: 'platform',
        description: 'Core airframe and platform model',
        parent_branch: 'Core Platform (Core)',
        options: [
          { name: 'Hawk', code: 'HWK' },
          { name: 'Falcon', code: 'FLC' },
          { name: 'Eagle', code: 'EGL' },
        ],
      },
      {
        name: 'Gimbal',
        code: 'gimbal',
        description: 'Gimbal stabilization payload mount',
        parent_branch: 'Core Platform (Core)',
        options: [
          { name: 'With Gimbal (2-Axis)', code: 'G2' },
          { name: 'With Gimbal (3-Axis)', code: 'G3' },
          { name: 'Fixed Mount', code: 'FX' },
        ],
      },
      {
        name: 'Camera',
        code: 'camera',
        description: 'Primary visual or thermal sensor',
        parent_branch: 'Core Platform (Core)',
        options: [
          { name: 'Camera - C5', code: 'C5' },
          { name: 'Camera - C10', code: 'C10' },
          { name: 'Thermal Camera', code: 'THM' },
        ],
      },
      {
        name: 'Controller',
        code: 'controller',
        description: 'Remote telemetry controller mode',
        parent_branch: 'Add-ons',
        options: [
          { name: 'With Master / Slave', code: 'MS' },
          { name: 'Standard Handheld', code: 'STD' },
          { name: 'Ground Station', code: 'GCS' },
        ],
      },
      {
        name: 'Payload',
        code: 'payload',
        description: 'Secondary task payload attachments',
        parent_branch: 'Add-ons',
        options: [
          { name: 'No', code: 'NPL' },
          { name: 'LiDAR Unit', code: 'LDR' },
          { name: 'Drop Mechanism', code: 'DRP' },
        ],
      },
      {
        name: 'Other Customization',
        code: 'other_customization',
        description: 'Optional peripherals and accessories',
        parent_branch: 'Add-ons',
        options: [
          { name: 'No', code: 'NCST' },
          { name: 'Long Range Antenna', code: 'LRA' },
          { name: 'Rugged Case', code: 'RGC' },
        ],
      },
    ];

    for (const cat of categories) {
      const savedCat = await this.categoryRepo.save({
        name: cat.name,
        code: cat.code,
        description: cat.description,
        parent_branch: cat.parent_branch,
      });

      if (cat.options?.length) {
        await this.optionRepo.save(
          cat.options.map((opt) => ({
            category_id: savedCat.id,
            name: opt.name,
            code: opt.code,
          })),
        );
      }
    }
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

  // Configured Products
  async getConfiguredProducts() {
    const [products, count] = await this.configuredProductRepo.findAndCount({
      order: { created_at: 'DESC' },
    });
    return {
      products,
      count,
    };
  }

  async createConfiguredProduct(dto: CreateConfiguredProductDto) {
    const newConfig = this.configuredProductRepo.create({
      product_code: dto.productCode.trim(),
      revision_number: dto.revisionNumber?.trim() || 'R0',
      revision_date: dto.revisionDate || new Date().toISOString().split('T')[0],
      configuration: dto.configuration || {},
      status: dto.status || 'PUBLISHED',
    });

    return await this.configuredProductRepo.save(newConfig);
  }
}
