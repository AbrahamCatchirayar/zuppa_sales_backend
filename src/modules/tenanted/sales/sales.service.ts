/* eslint-disable no-restricted-syntax, no-await-in-loop, no-return-await */
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
  CreateJobOrderDto,
  CreateOptionCodeDto,
  UpdateConfiguredProductDto,
  UpdateJobOrderDto,
  UpdateScheduleSpecDto,
} from './dto/sales.dto';
import { Category } from './entities/category.entity';
import { ConfiguredProduct } from './entities/configured-product.entity';
import { JobOrder } from './entities/job-order.entity';
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

  private get jobOrderRepo(): Repository<JobOrder> {
    if (!this.connection) {
      throw new BadRequestException('Tenant connection not found');
    }
    return this.connection.getRepository(JobOrder);
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
      dto.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_');

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
  async seedDefaultConfiguredProductsIfEmpty() {
    const count = await this.configuredProductRepo.count();
    if (count > 0) return;

    const mockProducts = [
      {
        product_code: 'ZUP-EZF-HWK-R0-1',
        revision_number: 'R0',
        revision_date: '2026-07-09',
        status: 'Published',
        configuration: {
          Brand: 'EZFly (EZF)',
          Platform: 'Hawk (HWK)',
          Application: 'Surveillance (SRV)',
          Gimbal: 'With Gimbal (2-Axis) (G2)',
          Camera: 'Camera - C5 (C5)',
          Controller: 'With Master / Slave (MS)',
          Payload: 'No (NPL)',
          'Other Customization': 'Yes, If Applicable - No If Not (Y/AN)',
        },
      },
      {
        product_code: 'ZUP-EZF-HWK-R0-2',
        revision_number: 'R0',
        revision_date: '2026-07-09',
        status: 'Published',
        configuration: {
          Brand: 'EZFly (EZF)',
          Platform: 'Hawk (HWK)',
          Application: 'Surveillance (SRV)',
          Gimbal: 'With Gimbal (2-Axis) (G2)',
          Camera: 'Camera - C5 (C5)',
          Controller: 'Without Master Slave (WMS)',
          Payload: 'No (NPL)',
          'Other Customization': 'Yes, If Applicable - No If Not (Y/AN)',
        },
      },
      {
        product_code: 'ZUP-EZF-HWK-R0-3',
        revision_number: 'R0',
        revision_date: '2026-07-09',
        status: 'Published',
        configuration: {
          Brand: 'EZFly (EZF)',
          Platform: 'Hawk (HWK)',
          Application: 'Surveillance (SRV)',
          Gimbal: 'Without Gimbal (NG)',
          Camera: 'NIL (NIL)',
          Controller: 'With Master / Slave (MS)',
          Payload: 'No (NPL)',
          'Other Customization': 'Yes, If Applicable - No If Not (Y/AN)',
        },
      },
      {
        product_code: 'ZUP-EZF-HWK-R0-4',
        revision_number: 'R0',
        revision_date: '2026-07-09',
        status: 'Published',
        configuration: {
          Brand: 'EZFly (EZF)',
          Platform: 'Hawk (HWK)',
          Application: 'Surveillance (SRV)',
          Gimbal: 'Without Gimbal (NG)',
          Camera: 'NIL (NIL)',
          Controller: 'Without Master Slave (WMS)',
          Payload: 'No (NPL)',
          'Other Customization': 'Yes, If Applicable - No If Not (Y/AN)',
        },
      },
      {
        product_code: 'ZUP-EZF-HWK-R0-5',
        revision_number: 'R0',
        revision_date: '2026-07-10',
        status: 'Published',
        configuration: {
          Brand: 'EZFly (EZF)',
          Platform: 'Hawk (HWK)',
          Application: 'Mapping & Survey (MAP)',
          Gimbal: 'With Gimbal (2-Axis) (G2)',
          Camera: 'Camera - C10 (C10)',
          Controller: 'Ground Station (GCS)',
          Payload: 'LiDAR Unit (LDR)',
          'Other Customization': 'Long Range Antenna (LRA)',
        },
      },
      {
        product_code: 'ZUP-AMH-HWK-R0-6',
        revision_number: 'R0',
        revision_date: '2026-07-11',
        status: 'Draft',
        configuration: {
          Brand: 'Ajeet Mini Hawk (AMH)',
          Platform: 'Hawk (HWK)',
          Application: 'Industrial Inspection (IND)',
          Gimbal: 'With Gimbal (3-Axis) (G3)',
          Camera: 'Thermal Camera (THM)',
          Controller: 'Standard Handheld (STD)',
          Payload: 'Drop Mechanism (DRP)',
          'Other Customization': 'Rugged Case (RGC)',
        },
      },
      {
        product_code: 'ZUP-EZF-HWK-R0-7',
        revision_number: 'R0',
        revision_date: '2026-07-12',
        status: 'Published',
        configuration: {
          Brand: 'EZFly (EZF)',
          Platform: 'Hawk (HWK)',
          Application: 'Surveillance (SRV)',
          Gimbal: 'With Gimbal (2-Axis) (G2)',
          Camera: 'Camera - C10 (C10)',
          Controller: 'With Master / Slave (MS)',
          Payload: 'No (NPL)',
          'Other Customization': 'No (NCST)',
        },
      },
      {
        product_code: 'ZUP-EZF-HWK-R0-8',
        revision_number: 'R0',
        revision_date: '2026-07-13',
        status: 'Published',
        configuration: {
          Brand: 'EZFly (EZF)',
          Platform: 'Hawk (HWK)',
          Application: 'Surveillance (SRV)',
          Gimbal: 'Without Gimbal (NG)',
          Camera: 'Camera - C5 (C5)',
          Controller: 'Ground Station (GCS)',
          Payload: 'LiDAR Unit (LDR)',
          'Other Customization': 'Rugged Case (RGC)',
        },
      },
    ];

    for (const item of mockProducts) {
      await this.configuredProductRepo.save(
        this.configuredProductRepo.create(item),
      );
    }
  }

  async getConfiguredProducts() {
    await this.seedDefaultConfiguredProductsIfEmpty();
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
      status: dto.status || 'Published',
    });

    return await this.configuredProductRepo.save(newConfig);
  }

  async updateConfiguredProduct(id: string, dto: UpdateConfiguredProductDto) {
    const product = await this.configuredProductRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Configured product with ID ${id} not found`);
    }

    if (dto.productCode !== undefined)
      product.product_code = dto.productCode.trim();
    if (dto.revisionNumber !== undefined)
      product.revision_number = dto.revisionNumber.trim();
    if (dto.revisionDate !== undefined)
      product.revision_date = dto.revisionDate;
    if (dto.configuration !== undefined)
      product.configuration = dto.configuration;
    if (dto.status !== undefined) product.status = dto.status;

    return await this.configuredProductRepo.save(product);
  }

  async deleteConfiguredProduct(id: string) {
    const product = await this.configuredProductRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Configured product with ID ${id} not found`);
    }
    await this.configuredProductRepo.remove(product);
    return {
      success: true,
      message: 'Configured product deleted successfully',
    };
  }

  // ==================== JOB ORDERS ====================

  async seedDefaultJobOrdersIfEmpty() {
    const count = await this.jobOrderRepo.count();
    if (count > 0) return;

    const mockOrders = [
      {
        work_order_no: 'WO-2026-001',
        customer_name: 'AeroGroup Solutions',
        contact_person: 'Robert Chen',
        contact_mobile: '+1 (555) 019-2831',
        customer_email: 'r.chen@aerogroup.com',
        customer_address: '100 Innovation Way, Suite 400, Boston, MA 02110',
        purchase_order_number: 'PO-882010',
        order_type: 'New',
        payment_status: 'Paid',
        status: 'Inventory Allocation',
        status_item_count: '6/7 ITEM',
        date_of_request: '2026-07-06',
        target_delivery_date: '2026-07-20',
        actual_delivery_date: '2026-07-22',
        requested_by: 'Sales Operations',
        products_included: [
          {
            id: '1',
            product_code: 'ZUP-EZF-HWK-R0-1',
            customized_code: 'ZUP-EZF-HWK-R0-1',
            quantity: 3,
            custom_notes: 'Special warning paint',
            configuration: {
              Brand: 'EZFly (EZF)',
              Platform: 'Hawk (HWK)',
              Application: 'Surveillance (SRV)',
              Gimbal: 'With Gimbal (2-Axis)',
              Camera: 'Camera - C5',
              Controller: 'With Master / Slave',
              Payload: 'No',
            },
          },
        ],
        milestones: [
          {
            id: 'm1',
            title: 'Batch 1: Initial Assemblies',
            target_date: '2026-07-20',
            quantity: 3,
            special_instructions: 'Standard delivery',
          },
        ],
        addons: [],
        internal_notes: 'High priority commercial client.',
      },
      {
        work_order_no: 'WO-2026-002',
        customer_name: 'GeoScan Surveys Corp',
        contact_person: 'Elena Rostova',
        contact_mobile: '+1 (555) 034-7728',
        customer_email: 'e.rostova@geoscan.io',
        customer_address: '2400 Mapping Boulevard, Denver, CO 80202',
        purchase_order_number: 'PO-784920',
        order_type: 'Replacement',
        payment_status: 'Pending',
        status: 'Engineering Review',
        status_item_count: '4/4 ITEM',
        date_of_request: '2026-07-07',
        target_delivery_date: '2026-07-20',
        actual_delivery_date: '2026-08-02',
        requested_by: 'Field Support',
        products_included: [
          {
            id: '2',
            product_code: 'ZUP-AMH-HWK-R0-1',
            customized_code: 'ZUP-AMH-HWK-R0-1 + [Special warning paint]',
            quantity: 1,
            custom_notes: 'Special warning paint',
            configuration: {
              Brand: 'Ajeet Mini Hawk (AMH)',
              Platform: 'Hawk (HWK)',
              Application: 'Inspection (INS)',
              Gimbal: 'Gimbal (3-Axis)',
              Camera: 'Day Camera - A5 Mini',
              Controller: 'MK15 - Controller + Screen',
              Payload: 'Yes - Trigger',
            },
          },
        ],
        milestones: [],
        addons: [],
        internal_notes: 'Replacement unit under warranty.',
      },
      {
        work_order_no: 'WO-2026-003',
        customer_name: 'Global Transit Express (RTX)',
        contact_person: 'Marcus Brady',
        contact_mobile: '+1 (555) 853-7721',
        customer_email: 'ops@globaltransit.com',
        customer_address: '88 Logistics Circle, Dallas, TX 75201',
        purchase_order_number: 'PO-773019',
        order_type: 'Others',
        payment_status: 'Partially Paid',
        status: 'Procurement',
        status_item_count: '6/7 ITEM',
        date_of_request: '2026-07-05',
        target_delivery_date: '2026-07-20',
        actual_delivery_date: '2026-07-20',
        requested_by: 'Enterprise Sales',
        products_included: [
          {
            id: '3',
            product_code: 'ZUP-EZF-HWK-R0-2',
            customized_code: 'ZUP-EZF-HWK-R0-2 + [Heavy rain-proofing coating]',
            quantity: 5,
            custom_notes: 'Heavy rain-proofing coating',
            configuration: {
              Brand: 'EZFly (EZF)',
              Platform: 'Hawk (HWK)',
              Application: 'Surveillance (SRV)',
              Gimbal: 'With Gimbal (2-Axis)',
              Camera: 'Camera - C5',
              Controller: 'Without Master Slave',
              Payload: 'No',
            },
          },
        ],
        milestones: [],
        addons: [],
        internal_notes: 'Rainproofing required for humid coastal routes.',
      },
      {
        work_order_no: 'WO-2026-004-GEM',
        customer_name: 'Defense Surveillance & Border Recon Wing (GeM Procurement)',
        contact_person: 'Col. Vikram Rathore (Consignee Authority)',
        contact_mobile: '+91 98110 49231',
        customer_email: 'consignee.scout@gov.defense.in',
        customer_address: 'Northern Command Logistics Depot, Sector 18, Military Station',
        purchase_order_number: 'GEM-PO-2026-88910',
        order_type: 'New',
        payment_status: 'Pending',
        status: 'Ready',
        status_item_count: '1/1 ITEM',
        date_of_request: '2026-07-02',
        target_delivery_date: '2026-07-27',
        actual_delivery_date: '2026-07-26',
        requested_by: 'Defense Liaison',
        products_included: [
          {
            id: '4',
            product_code: 'ZUP-EZF-HWK-R0-1',
            customized_code: 'ZUP-EZF-HWK-R0-1 + [MIL-Spec Encrypted Telemetry + Hardened Carbon]',
            quantity: 2,
            custom_notes: 'Mil-Spec Encrypted Telemetry Module + Hardened Carbon Chassis',
            configuration: {
              Brand: 'EZFly (EZF)',
              Platform: 'Hawk (HWK)',
              Application: 'Surveillance (SRV)',
              Gimbal: 'With Gimbal (2-Axis)',
              Camera: 'Camera - C5',
              Controller: 'With Master / Slave',
              Payload: 'No',
            },
          },
        ],
        milestones: [],
        addons: [],
        internal_notes: 'Requires defense inspection sign-off.',
      },
      {
        work_order_no: 'WO-2026-005',
        customer_name: 'AeroTech Commercial Deliveries Ltd',
        contact_person: 'Sophia Chen',
        contact_mobile: '+1 (555) 234-8890',
        customer_email: 's.chen@aerotech.com',
        customer_address: '700 Innovation Way, Austin, TX 78701',
        purchase_order_number: 'PO-A983-9921',
        order_type: 'New',
        payment_status: 'Paid',
        status: 'Ready',
        status_item_count: '1/1 ITEM',
        date_of_request: '2026-07-08',
        target_delivery_date: '2026-07-25',
        actual_delivery_date: '2026-07-25',
        requested_by: 'Commercial Sales',
        products_included: [
          {
            id: '5',
            product_code: 'ZUP-AMH-HWK-R0-2',
            customized_code: 'ZUP-AMH-HWK-R0-2 + [Standard Cam Drop]',
            quantity: 1,
            custom_notes: 'Standard commercial dual camera payload',
            configuration: {
              Brand: 'Ajeet Mini Hawk (AMH)',
              Platform: 'Hawk (HWK)',
              Application: 'Inspection (INS)',
              Gimbal: 'Gimbal (3-Axis)',
              Camera: 'Day Camera - A5 Mini',
              Controller: 'MK15 - Controller + Screen',
              Payload: 'Yes - Servo',
            },
          },
        ],
        milestones: [],
        addons: [],
        internal_notes: '',
      },
      {
        work_order_no: 'WO-2026-006-POL',
        customer_name: 'State Police Department & Disaster Response Directorate',
        contact_person: 'Superintendent R.K. Sharma (IPS)',
        contact_mobile: '+91 94120 44001',
        customer_email: 'scout.policedispatch@gov.in',
        customer_address: 'Police Headquarters, 5th Floor Command Center, Sector 3',
        purchase_order_number: 'STATE-POL-TENDER-2026-4401',
        order_type: 'New',
        payment_status: 'Paid',
        status: 'Ready',
        status_item_count: '1/1 ITEM',
        date_of_request: '2026-07-10',
        target_delivery_date: '2026-07-28',
        actual_delivery_date: '2026-07-26',
        requested_by: 'Public Safety Team',
        products_included: [
          {
            id: '6',
            product_code: 'ZUP-EZF-HWK-R0-1',
            customized_code: 'ZUP-EZF-HWK-R0-1 + [Police Strobe + 30x Zoom + Thermal IR]',
            quantity: 4,
            custom_notes: 'Police Strobe Lighting + 30x Optical Zoom + Thermal EO Gimbal',
            configuration: {
              Brand: 'EZFly (EZF)',
              Platform: 'Hawk (HWK)',
              Application: 'Surveillance (SRV)',
              Gimbal: 'With Gimbal (2-Axis)',
              Camera: 'Camera - C5',
              Controller: 'With Master / Slave',
              Payload: 'No',
            },
          },
        ],
        milestones: [],
        addons: [],
        internal_notes: '',
      },
      {
        work_order_no: 'WO-2026-007-AGRI',
        customer_name: 'Precision Agri-Tech & Forestry Surveys Ltd',
        contact_person: 'David Miller',
        contact_mobile: '+1 (555) 682-9920',
        customer_email: 'd.miller@precisionagri.io',
        customer_address: '450 Agronomy Parkway, Suite 1200, Fresno, CA 93720',
        purchase_order_number: 'PO-AGRI-2026-7731',
        order_type: 'New',
        payment_status: 'Paid',
        status: 'Ready',
        status_item_count: '1/1 ITEM',
        date_of_request: '2026-07-12',
        target_delivery_date: '2026-07-29',
        actual_delivery_date: '2026-07-29',
        requested_by: 'Agricultural Division',
        products_included: [
          {
            id: '7',
            product_code: 'ZUP-EZF-HWK-R0-1',
            customized_code: 'ZUP-EZF-HWK-R0-1 + [Multispectral Sensor + 2x Packs]',
            quantity: 3,
            custom_notes: 'Multispectral Sensor Payload + 2x Extra Flight Packs',
            configuration: {
              Brand: 'EZFly (EZF)',
              Platform: 'Hawk (HWK)',
              Application: 'Surveillance (SRV)',
              Gimbal: 'With Gimbal (2-Axis)',
              Camera: 'Camera - C5',
              Controller: 'With Master / Slave',
              Payload: 'No',
            },
          },
        ],
        milestones: [],
        addons: [],
        internal_notes: '',
      },
    ];

    for (const item of mockOrders) {
      await this.jobOrderRepo.save(this.jobOrderRepo.create(item));
    }
  }

  async getJobOrders() {
    await this.seedDefaultJobOrdersIfEmpty();
    const [orders, count] = await this.jobOrderRepo.findAndCount({
      order: { created_at: 'DESC' },
    });
    return {
      orders,
      count,
    };
  }

  async getJobOrderById(id: string) {
    const order = await this.jobOrderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Job order with ID ${id} not found`);
    }
    return order;
  }

  async createJobOrder(dto: CreateJobOrderDto) {
    const newOrder = this.jobOrderRepo.create({
      work_order_no: dto.workOrderNo.trim(),
      purchase_order_number: dto.purchaseOrderNumber?.trim() || null,
      date_of_request:
        dto.dateOfRequest || new Date().toISOString().split('T')[0],
      requested_by: dto.requestedBy?.trim() || 'Sales Team / Operator',
      customer_name: dto.customerName.trim(),
      contact_person: dto.contactPerson?.trim() || null,
      contact_mobile: dto.contactMobile?.trim() || null,
      customer_email: dto.customerEmail?.trim() || null,
      customer_address: dto.customerAddress?.trim() || null,
      target_delivery_date: dto.targetDeliveryDate || null,
      actual_delivery_date: dto.actualDeliveryDate || null,
      payment_status: dto.paymentStatus || 'Pending',
      order_type: dto.orderType || 'New',
      pdf_attachment_url: dto.pdfAttachmentUrl || null,
      products_included: dto.productsIncluded || [],
      milestones: dto.milestones || [],
      addons: dto.addons || [],
      internal_notes: dto.internalNotes || null,
      status: dto.status || 'Engineering Review',
      status_item_count:
        dto.statusItemCount ||
        `${dto.productsIncluded?.length || 1}/${dto.productsIncluded?.length || 1} ITEM`,
    });

    return await this.jobOrderRepo.save(newOrder);
  }

  async updateJobOrder(id: string, dto: UpdateJobOrderDto) {
    const order = await this.getJobOrderById(id);

    if (dto.workOrderNo !== undefined)
      order.work_order_no = dto.workOrderNo.trim();
    if (dto.purchaseOrderNumber !== undefined)
      order.purchase_order_number = dto.purchaseOrderNumber.trim();
    if (dto.dateOfRequest !== undefined)
      order.date_of_request = dto.dateOfRequest;
    if (dto.requestedBy !== undefined) order.requested_by = dto.requestedBy;
    if (dto.customerName !== undefined)
      order.customer_name = dto.customerName.trim();
    if (dto.contactPerson !== undefined)
      order.contact_person = dto.contactPerson;
    if (dto.contactMobile !== undefined)
      order.contact_mobile = dto.contactMobile;
    if (dto.customerEmail !== undefined)
      order.customer_email = dto.customerEmail;
    if (dto.customerAddress !== undefined)
      order.customer_address = dto.customerAddress;
    if (dto.targetDeliveryDate !== undefined)
      order.target_delivery_date = dto.targetDeliveryDate;
    if (dto.actualDeliveryDate !== undefined)
      order.actual_delivery_date = dto.actualDeliveryDate;
    if (dto.paymentStatus !== undefined)
      order.payment_status = dto.paymentStatus;
    if (dto.orderType !== undefined) order.order_type = dto.orderType;
    if (dto.pdfAttachmentUrl !== undefined)
      order.pdf_attachment_url = dto.pdfAttachmentUrl;
    if (dto.productsIncluded !== undefined)
      order.products_included = dto.productsIncluded;
    if (dto.milestones !== undefined) order.milestones = dto.milestones;
    if (dto.addons !== undefined) order.addons = dto.addons;
    if (dto.internalNotes !== undefined)
      order.internal_notes = dto.internalNotes;
    if (dto.status !== undefined) order.status = dto.status;
    if (dto.statusItemCount !== undefined)
      order.status_item_count = dto.statusItemCount;
    if (dto.scheduleSpec !== undefined)
      order.schedule_spec = dto.scheduleSpec;

    return await this.jobOrderRepo.save(order);
  }

  async deleteJobOrder(id: string) {
    const order = await this.getJobOrderById(id);
    await this.jobOrderRepo.remove(order);
    return {
      success: true,
      message: 'Job order deleted successfully',
    };
  }

  // Production Scheduler
  async getProductionSchedules() {
    await this.seedDefaultJobOrdersIfEmpty();
    const [orders, count] = await this.jobOrderRepo.findAndCount({
      order: { work_order_no: 'ASC' },
    });
    return { orders, count };
  }

  async getProductionScheduleById(id: string) {
    return await this.getJobOrderById(id);
  }

  async updateProductionSchedule(id: string, dto: UpdateScheduleSpecDto) {
    const order = await this.getJobOrderById(id);
    order.schedule_spec = dto.scheduleSpec || {};
    return await this.jobOrderRepo.save(order);
  }
}

