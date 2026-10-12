/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable import/no-unresolved */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { MailServiceRq } from 'src/mail/mail.service';
import { Dashboard } from 'src/modules/base/dashboard/entities/dashboard.entity';
import { DashboardBlock } from 'src/modules/base/dashboard/entities/dashboard_block.entity';
import { DashboardColumn } from 'src/modules/base/dashboard/entities/dashboard_column.entity';
import { DashboardCombinedParameter } from 'src/modules/base/dashboard/entities/dashboard_combined_parameter.entity';
import { DashboardCustomParameter } from 'src/modules/base/dashboard/entities/dashboard_custom_parameter.entity';
import { DashboardItem } from 'src/modules/base/dashboard/entities/dashboard_item.entity';
import { DashboardTab } from 'src/modules/base/dashboard/entities/dashboard_tabs.entity';
import { DashboardType } from 'src/modules/base/dashboard/entities/dashboard_type.entity';
import { Standard } from 'src/modules/base/standards/standard.entity';
import { StandardModule } from 'src/modules/base/standards/standard_modules/standard_module.entity';
import { StandardTemplate } from 'src/modules/base/standards/standard_templates/standard_template.entity';
import { CustomParameter } from 'src/modules/base/widgets/entities/custom_parameter.entity';
import { Widget } from 'src/modules/base/widgets/entities/widget.entity';
import { WidgetFiltersEntity } from 'src/modules/base/widgets/entities/widget_filter.entity';
import { WidgetItem } from 'src/modules/base/widgets/entities/widget_item.entity';
import { WidgetType } from 'src/modules/base/widgets/entities/widget_type.entity';
import { ActivityType, consolidatedGrouping, JOIN_RELATIONS } from 'src/utils';
import {
  Brackets,
  DataSource,
  DeepPartial,
  ILike,
  In,
  Like,
  Repository,
} from 'typeorm';
import { CONNECTION } from '../../tenancy/tenancy.symbol';
import { TenantActivity } from '../activitylog/tenantactivity.entity';
import { TenantActivityService } from '../activitylog/tenantactivity.service';
import { ChatbotService } from '../chatbot/chatbot.service';
import { ConsolidatedResponse } from '../consolidated/consolidated_response.entity';
import { CustomType } from '../customdashboard/customcharts/entities/type.entity';
import { CustomDashboard } from '../customdashboard/entities/custom_dashboard.entity';
import { Site } from '../sites/sites.entity';
import { User } from '../user/entities/user.entity';
import { ConsolidatedModule } from './conslidate_modules.interface';
import {
  TASK_DATACUBE,
  TASK_DATACUBE_RELATIONS,
  WIDGET_RELATIONS,
} from './constants/task.constant';
import { configDto, DatacubeDto, UpdateDataCubeDto } from './datacube.dto';
import { Datacube, DatacubeStatus } from './datacube.entity';
import { DataCubeConfig } from './datacube_config.entity';
import {
  DataCubeFrequency,
  DataCubeFrequencyStatus,
} from './datacube_frequency.entity';
import { DataCubeGroupQuestionsRule } from './questions/group_questions/group_question.entity';
import { DataCubeGroupQuestions } from './questions/group_questions/group_question_sequence.entity';
import { DataCubeMixedTypeQuestion } from './questions/mixed_questions/mixed_question.entity';
import { DataCubeQuestion } from './questions/question.entity';
import { DataCubeQuestionOption } from './questions/question_options/question_option.entity';
import { DataCubeQuestionRules } from './questions/question_sequences/question_rules/question_rule.entity';
import { DataCubeQuestionSequences } from './questions/question_sequences/question_sequence.entity';
import { DataCubeTask } from './task/task.entity';
import { TaskQuestionAnswer } from './task/task_question_answer.entity';
import { TaskQuestion } from './task/task_questions.entity';

interface DatacubeQuestion {
  id: string;
  title: string;
  description: string;
  question_type: string;
  placeholder: string;
  sub_indicator_name: string;
  option_type: string;
  question_options?: {
    id: string;
    text: string;
    value: string;
  }[];
  mixed_questions?: {
    value_question_type: string;
    value_name: string;
    unit_name: string;
    unit_type: string;
    unit_enum: string[];
    value_enum: string[];
  }[];
}

interface DatacubeQuestionSequence {
  sequence: number;
  is_dependent: boolean;
  datacube_question: DataCubeQuestion;
  questable_type: string;
  question_rules?: any[];
  group_question_rule?: any;
}

interface DatacubeIndicator {
  indicator_id: string;
  indicator_name: string;
  datacube_questions: DatacubeQuestion[];
  datacube_question_sequence: DatacubeQuestionSequence[];
}

interface DatacubeModule {
  module_id: string;
  module_name: string;
  indicators: Record<string, DatacubeIndicator>;
}

interface DatacubeModuleResponse {
  module_id: string;
  module_name: string;
  indicators: DatacubeIndicator[];
}

export interface DataCubeModuleStdResponse {
  success: boolean;
  data: DatacubeModuleResponse[];
}

interface IndicatorData {
  indicator_name: string;
  widgets: any[];
}

interface ModuleData {
  module_id: string;
  module_name: string;
  widgets: any[];
  indicators: Record<string, IndicatorData>;
}

interface MacroFunctionEntry {
  customParameterId: string;
  macroFunction: string;
  widgetId: string;
  source: string;
  blockId: string;
  columnId: string;
  typeId: string;
  blockSequence: number;
  columnSequence: number;
  typeSequence?: number;
  uids:
    | {
        uid: string;
        is_latest_data: boolean;
        answer?: string | number;
      }[]
    | null;
}

interface CombinedParamGroup {
  combinedId: string;
  widgetType: string;
  isTimeSeries: boolean;
  macroFunctions: MacroFunctionEntry[];
}

// Global Warming Potentials
const GWP_CH4 = 25; // CH4
const GWP_N2O = 298; // N2O

// Conversion table
export const unitConversions: Record<
  string,
  { baseUnit: string; factor: number | ((val: number) => number) }
> = {
  // ------------------ Currency ------------------
  '₹': { baseUnit: 'Lakh ₹', factor: 0.00001 },
  'Thousand ₹': { baseUnit: 'Lakh ₹', factor: 0.01 },
  'Lakh ₹': { baseUnit: 'Lakh ₹', factor: 1 },
  'Crore ₹': { baseUnit: 'Lakh ₹', factor: 100 },
  'USD ($)': { baseUnit: 'Lakh ₹', factor: 0.0008874 },
  'EUR (€)': { baseUnit: 'Lakh ₹', factor: 0.0010466 },
  'GBP (£)': { baseUnit: 'Lakh ₹', factor: 0.0011993 },
  'JPY (¥)': { baseUnit: 'Lakh ₹', factor: 0.000006006 },

  // ------------------ Mass ------------------
  'Kilogram (kg)': { baseUnit: 'tonnes', factor: 0.001 },
  'Gram (g)': { baseUnit: 'tonnes', factor: 0.000001 },
  'tonnes (t)': { baseUnit: 'tonnes', factor: 1 },
  'Pound (lb)': { baseUnit: 'tonnes', factor: 0.00045359237 },
  'Ounce (oz)': { baseUnit: 'tonnes', factor: 0.00002835 },

  // ------------------ Length ------------------
  'Meter (m)': { baseUnit: 'km', factor: 0.001 },
  'Centimeter (cm)': { baseUnit: 'km', factor: 0.00001 },
  'Kilometer (km)': { baseUnit: 'km', factor: 1 },
  'Inch (in)': { baseUnit: 'km', factor: 0.0000254 },
  'Foot (ft)': { baseUnit: 'km', factor: 0.0003048 },
  'Mile (mi)': { baseUnit: 'km', factor: 1.609344 },

  // ------------------ Area ------------------
  'Square meter (m²)': { baseUnit: 'm²', factor: 1 },
  'Hectare (ha)': { baseUnit: 'm²', factor: 10000 },
  Acre: { baseUnit: 'm²', factor: 4046.856422 },
  'Square foot (ft²)': { baseUnit: 'm²', factor: 0.09290304 },

  // ------------------ Volume ------------------
  'Cubic meter (m³)': { baseUnit: 'KL', factor: 1 },
  'Liter (L)': { baseUnit: 'KL', factor: 0.001 },
  'Milliliter (mL)': { baseUnit: 'KL', factor: 0.000001 },
  'Gallon (US)': { baseUnit: 'KL', factor: 0.00378541 },
  'Barrel (oil)': { baseUnit: 'KL', factor: 0.15898729 },

  // ------------------ Density ------------------
  'kg/m³': { baseUnit: 'kg/m³', factor: 1 },
  'g/cm³': { baseUnit: 'kg/m³', factor: 1000 },
  'lb/ft³': { baseUnit: 'kg/m³', factor: 16.01846337 },

  // ------------------ Time ------------------
  'Second (s)': { baseUnit: 's', factor: 1 },
  'Minute (min)': { baseUnit: 's', factor: 60 },
  'Hour (h)': { baseUnit: 's', factor: 3600 },
  Day: { baseUnit: 's', factor: 86400 },
  Year: { baseUnit: 's', factor: 31536000 },

  // ------------------ Energy ------------------
  'Joule (J)': { baseUnit: 'GJ', factor: 1e-9 },
  'Calorie (cal)': { baseUnit: 'GJ', factor: 4.184e-9 },
  'Gigajoules (GJ)': { baseUnit: 'GJ', factor: 1 },
  BTU: { baseUnit: 'GJ', factor: 1.05506e-6 },

  // ------------------ Electricity ------------------
  'Units of electricity': { baseUnit: 'GWh', factor: 1e-9 },
  'Kilowatt-hour (kWh)': { baseUnit: 'GWh', factor: 1e-6 },
  'Megawatt-hour (MWh)': { baseUnit: 'GWh', factor: 0.001 },

  // ------------------ Power ------------------
  'Watt (W)': { baseUnit: 'W', factor: 1 },
  'Kilowatt (kW)': { baseUnit: 'W', factor: 1000 },
  'Horsepower (hp)': { baseUnit: 'W', factor: 745.699872 },

  // ------------------ Pressure ------------------
  'Pascal (Pa)': { baseUnit: 'Pa', factor: 1 },
  Bar: { baseUnit: 'Pa', factor: 100000 },
  atm: { baseUnit: 'Pa', factor: 101325 },
  psi: { baseUnit: 'Pa', factor: 6894.757293 },

  // ------------------ Temperature ------------------
  'Kelvin (K)': { baseUnit: 'K', factor: 1 },
  'Celsius (°C)': { baseUnit: 'K', factor: (val) => val + 273.15 },
  'Fahrenheit (°F)': {
    baseUnit: 'K',
    factor: (val) => (val - 32) * 0.5556 + 273.15,
  },

  // ------------------ Speed ------------------
  'm/s': { baseUnit: 'm/s', factor: 1 },
  'km/h': { baseUnit: 'm/s', factor: 0.27777778 },
  mph: { baseUnit: 'm/s', factor: 0.44704 },
  knot: { baseUnit: 'm/s', factor: 0.51444444 },

  // ------------------ Fuel Efficiency ------------------
  'km/L': { baseUnit: 'km/L', factor: 1 },
  'L/100 km': { baseUnit: 'km/L', factor: 100 },
  'mpg (US)': { baseUnit: 'km/L', factor: 0.42514371 },
  'mpg (UK)': { baseUnit: 'km/L', factor: 0.35400619 },

  // ------------------ Transport Activity ------------------
  'tonne-km': { baseUnit: 'tonne-km', factor: 1 },
  'passenger-km': { baseUnit: 'passenger-km', factor: 1 },

  // ------------------ Emissions ------------------
  'kg CO₂': { baseUnit: 't CO₂e', factor: 0.001 },
  't CO₂': { baseUnit: 't CO₂e', factor: 1 },
  'g CO₂': { baseUnit: 't CO₂e', factor: 0.000001 },
  'kg CH₄': { baseUnit: 't CO₂e', factor: (val) => 0.001 * val * GWP_CH4 },
  'kg N₂O': { baseUnit: 't CO₂e', factor: (val) => 0.001 * val * GWP_N2O },
  'kg CO₂e': { baseUnit: 't CO₂e', factor: 0.001 },
};

@Injectable()
export class DataCubeService {
  constructor(
    @InjectRepository(Datacube)
    private readonly datacubeModel: Repository<Datacube>,

    @InjectRepository(DataCubeConfig)
    private readonly datacubeConfigModel: Repository<DataCubeConfig>,

    @InjectRepository(DataCubeFrequency)
    private readonly dataCubeFrequencyModel: Repository<DataCubeFrequency>,

    @InjectRepository(TaskQuestion)
    private readonly taskQuestionRepository: Repository<TaskQuestion>,

    @InjectRepository(DataCubeQuestionSequences)
    private readonly datacubequestionSequencesModel: Repository<DataCubeQuestionSequences>,

    @InjectRepository(Widget)
    private readonly widgetModel: Repository<Widget>,

    @InjectRepository(DataCubeQuestion)
    private readonly questionModel: Repository<DataCubeQuestion>,

    @InjectRepository(Site)
    private readonly siteModel: Repository<Site>,

    @InjectRepository(DataCubeQuestion)
    private readonly datacubeQuestionRepository: Repository<DataCubeQuestion>,

    @InjectRepository(TenantActivity)
    private readonly tenantActivityModel: Repository<TenantActivity>,

    @Inject(CONNECTION)
    private readonly connection: DataSource,

    @InjectDataSource()
    private readonly datasource: DataSource,
    private readonly mailService: MailServiceRq,
    private readonly activityService: TenantActivityService,
    private readonly chatbotService: ChatbotService,
  ) {
    this.datacubeModel = connection.getRepository(Datacube);
    this.questionModel = connection.getRepository(DataCubeQuestion);
    this.datacubequestionSequencesModel = connection.getRepository(
      DataCubeQuestionSequences,
    );
    this.datacubeConfigModel = connection.getRepository(DataCubeConfig);
    this.dataCubeFrequencyModel = connection.getRepository(DataCubeFrequency);
    this.siteModel = connection.getRepository(Site);
    this.datacubeQuestionRepository =
      connection.getRepository(DataCubeQuestion);
    this.tenantActivityModel = connection.getRepository(TenantActivity);
  }

  async findbyId(id: string) {
    const datacube = await this.datacubeModel.findOne({
      where: { id },
      relations: [
        'datacube_question_sequences.datacube_question',
        'datacube_frequency',
        'datacube_frequency.datacube_config',
        // 'datacube_question_sequences.datacube_question',
        // 'datacube_question_sequences.datacube_question.datacube_question_options',
        // 'datacube_question_sequences.datacube_question.mixed_questions',
        // 'datacube_question_sequences.datacube_question.datacube',
        // 'datacube_question_sequences.group_question_rule',
        // 'datacube_question_sequences.question_rules_id',
        // 'datacube_frequency.task',
        // 'datacube_frequency.task.task_questions',
        // 'datacube_frequency.task.task_questions.task_question_answers',
        // 'datacube_frequency.task.task_questions.task_comments',
      ],
      select: {
        id: true,
        name: true,
        description: true,
        frequency: true,
        financial_year: true,
        status: true,
        createdAt: true,
        standards: {
          id: true,
          name: true,
          logo_url: true,
          is_active: true,
        },
        datacube_question_sequences: {
          id: true,
          // sequence: true,
          // is_dependent: true,
          // questable_type: true,
          public_question_sequence_id: true,
          datacube_question: {
            id: true,
            // title: true,
            // question_type: true,
            // sub_indicator_id: true,
            // sub_indicator_name: true,
            // // department_id: true,
            // // department_name: true,
            // // option_type: true,
            // universal_question_id: true,
            // public_question_id: true,
          },
        },
        datacube_frequency: {
          id: true,
          frequency_name: true,
          status: true,
          datacube_config: {
            id: true,
            start_date: true,
            end_date: true,
          },
          task: {
            id: true,
            status: true,
          },
        },
      },
    });
    if (!datacube || datacube.is_deleted == true)
      throw new BadRequestException('Invalid Datacube');
    return datacube;
  }

  async validateFinancialYear(financialYear: string) {
    const years = financialYear.split('-');
    if (years.length !== 2) {
      throw new Error('Invalid financial year format: must be YYYY-YYYY');
    }

    const firstYear = parseInt(years[0]);
    const secondYear = parseInt(years[1]);

    if (
      firstYear.toString().length !== 4 ||
      secondYear.toString().length !== 4
    ) {
      throw new Error('Invalid financial year: years must be 4 digits');
    }
  }

  async validateStandards(standards) {
    const std = await this.datasource.manager.getRepository(Standard).find({
      where: { id: In(standards.map((standard) => standard.id)) },
    });
    return std.map((s) => ({
      id: s.id,
      name: s.name,
      logo_url: s.logo_url,
      is_active: s.is_active,
      is_deleted: s.is_deleted,
    })) as DeepPartial<Record<string, any>>[];
  }

  async findOne(datacube: DatacubeDto) {
    await this.validateFinancialYear(datacube.financial_year);
    const datacubes = await this.datacubeModel.findOne({
      where: {
        // name: datacube.name,
        financial_year: datacube.financial_year,
        // status: DatacubeStatus.DELETED,
        // is_deleted: true,
        // frequency: datacube.frequency,
      },
    });
    return datacubes;
  }

  async findCurrentFrequency(datacube: Datacube, queryRunner) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const savedFrequencies = [];

    // Parse financial year to check if it's current or past
    const [startYear, endYear] = datacube.financial_year
      .split('-')
      .map((year) => parseInt(year));
    const isCurrentFinancialYear = startYear === currentYear;

    switch (datacube.frequency) {
      case 'YEARLY':
        return await queryRunner.manager.getRepository(DataCubeFrequency).save({
          datacube: datacube.id,
          frequency_name: `${datacube.name}_${datacube.financial_year}`,
          status: 'CREATED',
          datacube_config: null,
          task: null,
        });
      case 'QUARTERLY':
        let currentQuarter: string;
        if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = 'Q1';
        else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = 'Q2';
        else if (currentMonth >= 10 && currentMonth <= 12)
          currentQuarter = 'Q3';
        else currentQuarter = 'Q4';
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

        // If it's current financial year, create up to current quarter
        // If it's past financial year, create all quarters
        const maxQuarterIndex = isCurrentFinancialYear
          ? quarters.indexOf(currentQuarter)
          : quarters.length - 1;

        for (let i = 0; i <= maxQuarterIndex; i++) {
          const frequency = await queryRunner.manager
            .getRepository(DataCubeFrequency)
            .save({
              datacube: datacube.id,
              frequency_name: quarters[i],
              status: 'CREATED',
              datacube_config: null,
              task: null,
            });
          savedFrequencies.push(frequency);
        }
        return savedFrequencies;
      default: // MONTHLY
        const months = [
          { num: 4, name: 'April' },
          { num: 5, name: 'May' },
          { num: 6, name: 'June' },
          { num: 7, name: 'July' },
          { num: 8, name: 'August' },
          { num: 9, name: 'September' },
          { num: 10, name: 'October' },
          { num: 11, name: 'November' },
          { num: 12, name: 'December' },
          { num: 1, name: 'January' },
          { num: 2, name: 'February' },
          { num: 3, name: 'March' },
        ];

        // If it's current financial year, create up to current month
        // If it's past financial year, create all months
        const currentMonthIndex = months.findIndex(
          (m) => m.num === currentMonth,
        );
        const maxMonthIndex = isCurrentFinancialYear
          ? currentMonthIndex
          : months.length - 1;

        for (let i = 0; i <= maxMonthIndex; i++) {
          const frequency = await queryRunner.manager
            .getRepository(DataCubeFrequency)
            .save({
              datacube: datacube.id,
              frequency_name: `${months[i].name}_${datacube.financial_year}`,
              status: 'CREATED',
              datacube_config: null,
              task: null,
            });
          savedFrequencies.push(frequency);
        }
        return savedFrequencies;
    }
  }

  async createDataCube(body: DatacubeDto, user: User) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const datacube = await this.findOne(body);
      await this.validateFinancialYear(body.financial_year);
      const standards = await this.validateStandards(body.standards);
      let savedDatacube;
      let frequency;

      if (datacube?.is_deleted) {
        await this.datacubeModel.update(datacube.id, {
          status: DatacubeStatus.CREATED,
          is_deleted: false,
          deleted_at: null,
          createdAt: new Date(),
        });
      } else if (datacube) {
        throw new BadRequestException('Datacube already exists');
      } else {
        savedDatacube = await queryRunner.manager.getRepository(Datacube).save({
          name: body.name,
          description: body?.description,
          frequency: body.frequency,
          financial_year: body.financial_year,
          standards,
          status: 'CREATED',
          createdAt: new Date(),
        });

        await this.datacube_questions_clone(savedDatacube, queryRunner);

        frequency = await this.findCurrentFrequency(savedDatacube, queryRunner);

        await this.activityService.createTenantActivity(
          ActivityType.DATA_CUBE_CREATED,
          savedDatacube.id,
          null,
          user,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Datacube created successfully',
        data: savedDatacube,
        frequency,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async UpdateDateCube(id: string, body: UpdateDataCubeDto, user: User) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const dataCube = await queryRunner.manager
        .getRepository(Datacube)
        .findOne({
          where: { id },
        });
      if (dataCube.status === DatacubeStatus.CREATED) {
        const standards = await this.validateStandards(body.standards);
        await queryRunner.manager.getRepository(Datacube).update(id, {
          description: body.description,
          frequency: body.frequency,
          financial_year: body.financial_year,
          updatedAt: new Date(),
          standards,
        });

        await this.activityService.createTenantActivity(
          ActivityType.DATA_CUBE_UPDATED,
          dataCube,
          null,
          user,
          queryRunner,
        );
      } else {
        throw new BadRequestException(
          `Cannot update datacube with status ${dataCube.status}`,
        );
      }
      return {
        success: true,
        message: 'Datacube updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDatacube(id: string, user: User) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const datacube = await queryRunner.manager
        .getRepository(Datacube)
        .findOne({
          where: { id },
        });
      if (datacube.status !== DatacubeStatus.CREATED) {
        throw new BadRequestException(
          `Cannot delete datacube with status ${datacube.status}`,
        );
      }

      await queryRunner.manager
        .getRepository(Datacube)
        .delete({ id: datacube.id });

      // await this.activityService.createTenantActivity(
      //   ActivityType.DATA_CUBE_DELETED,
      //   datacube,
      //   null,
      //   user,
      //   queryRunner,
      // );

      return {
        success: true,
        message: 'Datacube and all related entities deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error.message || 'Failed to delete datacube',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getDatacube(id: string) {
    return {
      success: true,
      data: await this.findbyId(id),
    };
  }

  async getDatacubes(param: any) {
    const { page, limit, skip, sort, filter } = param;
    const { search, is_deleted, ...otherFilters } = filter;

    const whereConditions: any = {
      ...otherFilters,
      is_deleted: is_deleted !== undefined ? is_deleted : false,
    };
    const query = {
      take: limit,
      skip,
      order: sort,
      where: whereConditions,
      relations: [
        // 'datacube_question_sequences',
        'datacube_frequency',
        'datacube_frequency.datacube_config',
        'datacube_frequency.task',
        'datacube_frequency.task.site',
        'datacube_frequency.task.site.business_unit',
        // 'datacube_frequency.task.data_provider',
        // 'datacube_frequency.task.data_reviewer',
        // 'datacube_frequency.task.task_questions',
        // 'datacube_frequency.task.task_questions.question_sequence',
        // 'datacube_frequency.task.task_questions.task_question_answers',
        // 'datacube_frequency.task.task_questions.task_comments',
      ],
      select: {
        id: true,
        name: true,
        description: true,
        frequency: true,
        financial_year: true,
        status: true,
        createdAt: true,
        standards: {
          id: true,
          name: true,
          logo_url: true,
          is_active: true,
        },
        // datacube_question_sequences: {
        // id: true,
        // sequence: true,
        // is_dependent: true,
        // questable_type: true,
        // public_question_sequence_id: true,
        // public_module_name: true,
        // public_indicator_name: true,
        // datacube_question: {
        //   id: true,
        //   public_question_id: true,
        // },
        // universal_question_id: true,
        // group_question_rule: {
        //   id: true,
        //   name: true,
        //   is_multiple: true,
        //   max_limit: true,
        // },
        // question_rules: {
        //   id: true,
        //   dependent_question_id: true,
        //   dependent_option_id: true,
        // },
        // group_question_sequences: {
        //   id: true,
        //   is_dependent: true,
        //   universal_question_id: true,
        //   datacube_question: {
        //     id: true,
        //     public_question_id: true,
        //   },
        // },
        // },
        datacube_frequency: {
          id: true,
          frequency_name: true,
          status: true,
          datacube_config: {
            id: true,
            start_date: true,
            end_date: true,
          },
          task: {
            id: true,
            status: true,
            site: {
              id: true,
              name: true,
            },
            // data_provider: {
            //   id: true,
            //   name: true,
            // },
            // data_reviewer: {
            //   id: true,
            //   name: true,
            // },
            // task_questions: {
            //   id: true,
            //   question_sequence: {
            //     id: true,
            //     sequence: true,
            //     is_dependent: true,
            //     questable_type: true,
            //     public_question_sequence_id: true,
            //     universal_question_id: true,
            //     public_module_name: true,
            //     public_indicator_name: true,
            //     datacube_question: {
            //       id: true,
            //       public_question_id: true,
            //     },
            //   },
            // },
          },
        },
      },
    };
    if (filter.search) {
      query.where = { ...whereConditions, name: ILike(`%${filter.search}%`) };
    }
    const [data, totalcount] = await this.datacubeModel.findAndCount(query);
    return {
      success: true,
      datacubes: data,
      meta: {
        currentcount: data.length,
        currentPage: page,
        currentlimit: limit,
        totalcount,
      },
    };
  }

  async createDatacubeFrequencyConfiguration(
    id: string,
    body: configDto,
    user: User,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let saveDatacubeConfig;

    try {
      const datacubefrequency = await queryRunner.manager
        .getRepository(DataCubeFrequency)
        .findOne({
          where: { id },
          relations: ['datacube'],
        });
      if (!datacubefrequency) {
        throw new BadRequestException('Invalid Datacube Frequency');
      }

      saveDatacubeConfig = await queryRunner.manager
        .getRepository(DataCubeConfig)
        .save({
          datacube: { id: datacubefrequency.datacube.id },
          start_date: body.start_date,
          end_date: body.end_date,
          // frequencies: datacubefrequency,
        });

      await this.activityService.createTenantActivity(
        ActivityType.DATA_CUBE_CONFIGURED,
        datacubefrequency.datacube,
        null,
        user,
        queryRunner,
      );

      const existingDatacubeConfig = await queryRunner.manager
        .getRepository(DataCubeFrequency)
        .find({
          where: {
            datacube: { id: datacubefrequency.datacube.id },
            // datacube_config: { id: saveDatacubeConfig.id },
          },
        });

      await queryRunner.manager
        .getRepository(Datacube)
        .update(datacubefrequency?.datacube?.id, {
          status: DatacubeStatus.SETUP,
        });

      const updatedFrequency = existingDatacubeConfig.map(async (freq) => {
        await queryRunner.manager
          .getRepository(DataCubeFrequency)
          .update(freq.id, {
            datacube_config: saveDatacubeConfig.id,
            status: DataCubeFrequencyStatus.INPROGRESS,
          });
      });

      await Promise.all(updatedFrequency);

      const dataProviders = await queryRunner.manager
        .getRepository(DataCubeTask)
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.data_provider', 'provider')
        .where('task.datacube_frequency = :frequencyId', {
          frequencyId: datacubefrequency.id,
        })
        .getMany();

      const uniqueTasks = this.getUniqueProviderTasks(dataProviders);

      // Send emails to data providers
      for (const task of uniqueTasks) {
        const provider = task.data_provider;

        await this.mailService.send('datacube-provider-notification', {
          to: provider.email,
          subject: `New Datacube Data Collection - ${user.account.slug}`,
          template: 'datacube-provider-notification',
          context: {
            providerName: provider.name,
            providerEmail: provider.email,
            startDate: body.start_date,
            accountName: user.account.slug,
            ownerName: user.name,
            datacubeName: datacubefrequency.datacube.name,
            frequencyName: datacubefrequency.frequency_name,
            endDate: body.end_date,
          },
        });
      }
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Configuration created successfully',
        data: saveDatacubeConfig,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  private getUniqueProviderTasks(dataProviders: any[]) {
    const providerMap = new Map<string, any>();

    for (const task of dataProviders) {
      providerMap.set(task.data_provider.email, task); // overrides duplicates but that's okay
    }

    return [...providerMap.values()];
  }

  async fetchAllStandards() {
    try {
      return this.datasource.manager
        .getRepository(Standard)
        .find({ where: { is_active: true, is_deleted: false } });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async datacubeClone(standard_ids: string[]): Promise<ConsolidatedModule[]> {
    try {
      const standardModulesQuery = this.datasource.manager
        .getRepository(StandardModule)
        .createQueryBuilder('sm');

      JOIN_RELATIONS.forEach(({ alias, path, type }) => {
        standardModulesQuery[type](
          path,
          alias,
          `${alias}.is_deleted = :isDeleted`,
        );
      });

      standardModulesQuery.setParameter('isDeleted', false);

      const standardModules = await standardModulesQuery
        .where('standard.id IN (:...standardIds)', {
          standardIds: standard_ids,
        })
        .andWhere('sm.is_deleted = :smIsDeleted', { smIsDeleted: false })
        .getMany();

      return consolidatedGrouping(standardModules, standard_ids);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async datacube_questions_clone(datacube: Datacube, queryRunner) {
    try {
      const clonedStandard: ConsolidatedModule[] = await this.datacubeClone(
        datacube.standards.map((id) => id.id),
      );

      // Process each module and its indicators
      for (const module of clonedStandard) {
        for (const indicator of module.indicators) {
          // Process standard questions
          for (const standardQuestion of indicator.standard_question) {
            // Create datacube question
            const datacubeQuestion = await queryRunner.manager
              .getRepository(DataCubeQuestion)
              .save({
                title: standardQuestion.title,
                description: standardQuestion.description,
                question_type: standardQuestion.question_type,
                placeholder: standardQuestion.placeholder,
                sub_indicator_id: standardQuestion.sub_indicator_id?.id,
                department: standardQuestion.department?.id,
                sub_indicator_name: standardQuestion.sub_indicator_id?.name,
                department_name: standardQuestion.department?.name,
                option_type: 'SINGLE',
                datacube,
                public_question_id: standardQuestion.id,
                universal_question_id: standardQuestion.universal_question_id,
                is_latest_data: standardQuestion.is_latest_data,
              });

            // Create question options if they exist
            if (standardQuestion.standard_question_options?.length > 0) {
              for (const option of standardQuestion.standard_question_options) {
                await queryRunner.manager
                  .getRepository(DataCubeQuestionOption)
                  .save({
                    text: option.text,
                    value: option.value,
                    question: datacubeQuestion,
                    public_question_option_id: option.id,
                    datacube,
                  });
              }
            }

            // Create mixed type questions if they exist
            if (standardQuestion.mixed_questions?.length > 0) {
              for (const mixedQuestion of standardQuestion.mixed_questions) {
                await queryRunner.manager
                  .getRepository(DataCubeMixedTypeQuestion)
                  .save({
                    value_question_type: mixedQuestion.value_question_type,
                    value_name: mixedQuestion.value_name,
                    value_enum: mixedQuestion.value_enum,
                    unit_name: mixedQuestion.unit_name,
                    unit_type: mixedQuestion.unit_type,
                    unit_enum: mixedQuestion.unit_enum,
                    question: datacubeQuestion,
                    datacube,
                  });
              }
            }
          }

          // Process question sequences
          for (const sequence of indicator.question_sequence) {
            const sequenceObject = {
              sequence: sequence.sequence,
              is_dependent: sequence.is_dependent,
              questable_type: sequence.questable_type,
              public_indicator_id: indicator.id,
              public_indicator_name: indicator.name,
              public_module_id: module.id,
              public_module_name: module.name,
              public_question_sequence_id: sequence.id,
              datacube,
              datacube_question:
                sequence.questable_type === 'STANDARD'
                  ? await queryRunner.manager
                      .getRepository(DataCubeQuestion)
                      .findOne({
                        where: {
                          public_question_id: sequence.standard_question_id?.id,
                          datacube: { id: datacube.id },
                        },
                      })
                  : null,
              universal_question_id: sequence.universal_question_id,
            };

            // Create question sequence
            const questionSequence = await queryRunner.manager
              .getRepository(DataCubeQuestionSequences)
              .save(sequenceObject);

            // Process question rules if they exist
            if (sequence.question_rules?.length > 0) {
              for (const rule of sequence.question_rules) {
                await queryRunner.manager
                  .getRepository(DataCubeQuestionRules)
                  .save({
                    question_sequence_id: questionSequence,
                    dependent_question_id: await queryRunner.manager
                      .getRepository(DataCubeQuestion)
                      .findOne({
                        where: {
                          public_question_id: rule.parent_question_id.id,
                          datacube: { id: datacube.id },
                        },
                      }),
                    dependent_option_id: rule.parent_option_id
                      ? await queryRunner.manager
                          .getRepository(DataCubeQuestionOption)
                          .findOne({
                            where: {
                              public_question_option_id:
                                rule.parent_option_id.id,
                              datacube: { id: datacube.id },
                            },
                          })
                      : null,
                    datacube,
                  });
              }
            }

            // Process group questions if they exist
            if (sequence.group_questions) {
              const groupQuestionRule = await queryRunner.manager
                .getRepository(DataCubeGroupQuestionsRule)
                .save({
                  is_multiple: sequence.group_questions.is_multiple,
                  name: sequence.group_questions.name,
                  max_limit: sequence.group_questions.max_limit,
                  group_rule: sequence.group_questions.group_rule,
                  datacube,
                  public_group_id: sequence.group_questions.id,
                });

              // Update question sequence with group question rule
              await queryRunner.manager
                .getRepository(DataCubeQuestionSequences)
                .update(questionSequence.id, {
                  group_question_rule: groupQuestionRule,
                });

              // Process group question sequences
              for (const groupSequence of sequence.group_questions
                .group_question_sequences) {
                const standard = groupSequence.standard_question;
                if (standard) {
                  // FIX: Add datacube filter when finding the question
                  const datacubeQuestion = await queryRunner.manager
                    .getRepository(DataCubeQuestion)
                    .findOne({
                      where: {
                        public_question_id: groupSequence.standard_question.id,
                        datacube: { id: datacube.id }, // ADD THIS LINE
                      },
                    });

                  await queryRunner.manager
                    .getRepository(DataCubeGroupQuestions)
                    .save({
                      group_question_rule: groupQuestionRule,
                      is_dependent: groupSequence.is_dependent,
                      universal_question_id: standard?.universal_question_id,
                      group_sequence: groupSequence.group_sequence,
                      datacube_question: datacubeQuestion,
                      datacube,
                    });
                }
              }
            }
          }
        }
      }

      return {
        success: true,
        message: 'Datacube questions cloned successfully',
        data: clonedStandard,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getDataCubeQuestions(
    datacubeId: string,
  ): Promise<DataCubeModuleStdResponse> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      const questionSequences = await queryRunner.manager
        .getRepository(DataCubeQuestionSequences)
        .createQueryBuilder('qs')
        .leftJoinAndSelect('qs.datacube_question', 'q')
        .leftJoinAndSelect('q.datacube_question_options', 'qo')
        .leftJoinAndSelect('q.mixed_questions', 'mq')
        .leftJoinAndSelect('qs.question_rules_id', 'qr')
        .leftJoinAndSelect('qr.dependent_question_id', 'dqi')
        .leftJoinAndSelect('qr.dependent_option_id', 'doi')
        .leftJoinAndSelect('qs.group_question_rule', 'gqr')
        .leftJoinAndSelect('gqr.datacube_group_questions', 'gqs')
        .leftJoinAndSelect('gqs.datacube_question', 'gq')
        .leftJoinAndSelect('gq.datacube_question_options', 'gqo')
        .leftJoinAndSelect('gq.mixed_questions', 'gmq')
        .where('qs.datacube = :datacubeId', { datacubeId })
        .orderBy('qs.public_module_name', 'ASC')
        .addOrderBy('qs.public_indicator_name', 'ASC')
        .addOrderBy('qs.sequence', 'ASC')
        .getMany();

      // Group the results by module and indicator
      const groupedResults = questionSequences.reduce<Record<string, any>>(
        (acc, curr) => {
          const moduleKey = curr.public_module_id;
          if (!acc[moduleKey]) {
            acc[moduleKey] = {
              module_id: curr.public_module_id,
              module_name: curr.public_module_name,
              indicators: {},
            };
          }

          const indicatorKey = curr.public_indicator_id;
          if (!acc[moduleKey].indicators[indicatorKey]) {
            acc[moduleKey].indicators[indicatorKey] = {
              indicator_id: curr.public_indicator_id,
              indicator_name: curr.public_indicator_name,
              datacube_questions: [],
              datacube_question_sequence: [],
            };
          }

          if (curr.datacube_question) {
            // load the group question into the datacube_questions
            acc[moduleKey].indicators[indicatorKey].datacube_questions.push({
              id: curr.datacube_question.id,
              title: curr.datacube_question.title,
              description: curr.datacube_question.description,
              place_holder: curr.datacube_question.placeholder,
              sub_indicator_name: curr.datacube_question.sub_indicator_name,
              option_type: curr.datacube_question.option_type,
              question_type: curr.datacube_question.question_type,
              question_options:
                curr.datacube_question.datacube_question_options?.map(
                  (option) => ({
                    id: option.id,
                    text: option.text,
                    value: option.value,
                  }),
                ),
              mixed_questions: curr.datacube_question.mixed_questions?.map(
                (mq) => ({
                  value_question_type: mq.value_question_type,
                  value_name: mq.value_name,
                  unit_name: mq.unit_name,
                  unit_type: mq.unit_type,
                  value_enum: mq.value_enum,
                  unit_enum: mq.unit_enum,
                }),
              ),
            });
          }

          // Add question sequence with all related data
          acc[moduleKey].indicators[
            indicatorKey
          ].datacube_question_sequence.push({
            ...curr,
          });

          return acc;
        },
        {},
      );

      // Convert the grouped object to array format
      return {
        success: true,
        data: Object.values(groupedResults).map((module) => ({
          module_id: module.module_id,
          module_name: module.module_name,
          indicators: Object.values(module.indicators),
        })),
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getTaskByDatacubefrequency(datacube_id: string, params: any) {
    try {
      const { page, limit, sort, filter } = params;

      // ✅ Build taskConditions instead of overwriting
      const taskConditions: any = {};

      if (filter.search) {
        taskConditions.task_questions = {
          question_sequence: {
            public_module_name: ILike(`%${filter.search}%`),
          },
        };
      }

      if (filter.site_name) {
        taskConditions.site = {
          name: ILike(`%${filter.site_name}%`),
        };
      }

      if (filter.task_status) {
        taskConditions.status = ILike(`%${filter.task_status}%`);
      }

      // Combine into one query
      const query = {
        where: {
          datacube: { id: datacube_id },
          ...(Object.keys(taskConditions).length > 0
            ? { task: taskConditions }
            : {}),
        },
      };

      // First, get all datacube frequencies to count total tasks
      const allDatacubeFrequencies = await this.dataCubeFrequencyModel.find({
        where: query.where,
        relations: TASK_DATACUBE.map((relation) => relation.path),
        select: {
          task: {
            id: true,
            status: true,
            site: {
              id: true,
              name: true,
              location: true,
            },
            datacube_frequency: {
              id: true,
              frequency_name: true,
              status: true,
              datacube: {
                id: true,
                financial_year: true,
                frequency: true,
              },
            },
            data_provider: {
              id: true,
              name: true,
            },
            data_reviewer: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Flatten all tasks and get total count
      const allTasks = allDatacubeFrequencies.flatMap(
        (frequency) => frequency.task,
      );
      const totalCount = allTasks.length;

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedTasks = allTasks.slice(skip, skip + limit);

      // Group tasks back by datacube frequency
      const datacubeFrequency = allDatacubeFrequencies
        .map((frequency) => {
          const tasks = frequency.task.filter((task) =>
            paginatedTasks.some(
              (paginatedTask) => paginatedTask.id === task.id,
            ),
          );

          // Flatten & simplify task objects
          const simplifiedTasks = tasks.map((task) => {
            const publicModuleName =
              task.task_questions?.[0]?.question_sequence?.public_module_name ||
              null;

            const publicModuleId =
              task.task_questions?.[0]?.question_sequence?.public_module_id ||
              null;

            const indicatorNames =
              task.task_questions?.map(
                (q) => q.question_sequence?.public_indicator_name,
              ) || [];

            const totalQuestionCount = task.task_questions
              ? task.task_questions.filter((q) => q.universal_question_id)
                  .length
              : 0;

            const uniqueIndicators = [
              ...new Set(indicatorNames.filter((name) => name)),
            ];

            return {
              id: task.id,
              status: task.status,
              site: task.site,
              data_provider: task.data_provider,
              data_reviewer: task.data_reviewer,
              datacube_frequency: task.datacube_frequency,
              module_name: publicModuleName,
              module_id: publicModuleId,
              indicator_name: uniqueIndicators,
              question_count: totalQuestionCount,
            };
          });

          return {
            ...frequency,
            task: simplifiedTasks,
          };
        })
        .filter((frequency) => frequency.task.length > 0);

      return {
        success: true,
        datacube: datacubeFrequency,
        meta: {
          currentPage: page,
          currentLimit: limit,
          currentCount: paginatedTasks.length,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getTaskByDatacubefrequencyOpt(datacube_id: string) {
    try {
      // STEP 1: Fetch all datacube frequencies with tasks (without task_questions)
      const datacubeFrequencies = await this.dataCubeFrequencyModel.find({
        where: { datacube: { id: datacube_id } },
        relations: [
          'task',
          'task.site',
          'task.data_provider',
          'task.data_reviewer',
          'datacube',
        ],
        select: {
          id: true,
          frequency_name: true,
          datacube: { id: true, financial_year: true },
          task: {
            id: true,
            status: true,
            site: { id: true, name: true },
            data_provider: { id: true, name: true },
            data_reviewer: { id: true, name: true },
          },
        },
      });

      // STEP 2: Get all task IDs
      const taskIds = datacubeFrequencies.flatMap((f) =>
        f.task.map((t) => t.id),
      );
      if (taskIds.length === 0) {
        return { success: true, data: [], meta: { totalCount: 0 } };
      }

      // STEP 3: Fetch one task_question per task with module name
      const taskModules = await this.connection
        .getRepository(TaskQuestion)
        .createQueryBuilder('tq')
        .innerJoin('tq.question_sequence', 'qs')
        .select(['tq.task AS task_id', 'qs.public_module_name AS module_name'])
        .where('tq.task IN (:...taskIds)', { taskIds })
        .groupBy('tq.task, qs.public_module_name')
        .getRawMany();

      // STEP 4: Build taskId → module_name map
      const taskIdToModule: Record<string, string> = {};
      taskModules.forEach((row) => {
        if (row.module_name) {
          taskIdToModule[row.task_id] = row.module_name;
        }
      });

      // STEP 5: Flatten tasks and attach module_name
      const tasks = datacubeFrequencies.flatMap((frequency) =>
        frequency.task.map((task) => ({
          id: task.id,
          module_name: taskIdToModule[task.id] || null,
          financial_year: frequency.datacube.financial_year,
          sitename: task.site?.name || null,
          frequency: frequency.frequency_name,
          status: task.status,
          data_provider: task.data_provider?.name || null,
          data_reviewer: task.data_reviewer?.name || null,
        })),
      );

      return {
        success: true,
        data: tasks,
        meta: { totalCount: tasks.length },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getBusinessUnitsByDatacube(datacube_id: string, status?: string) {
    try {
      // STEP 1: Fetch ALL datacube frequencies with ALL their tasks (no status filter)
      const datacubeFrequencies = await this.dataCubeFrequencyModel.find({
        where: {
          datacube: { id: datacube_id },
        },
        relations: [
          'task',
          'task.business_unit',
          'task.site',
          'task.task_questions',
          'task.task_questions.question_sequence',
          'datacube',
        ],
        select: {
          id: true,
          frequency_name: true,
          datacube: {
            id: true,
            frequency: true,
          },
          task: {
            id: true,
            status: true,
            business_unit: {
              id: true,
              name: true,
            },
            site: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      });

      // STEP 2: Extract ALL tasks with their frequency information
      const allTasks = datacubeFrequencies.flatMap((frequency) =>
        frequency.task.map((task) => ({
          ...task,
          frequency: frequency.datacube?.frequency,
          frequency_name: frequency.frequency_name,
        })),
      );

      if (allTasks.length === 0) {
        return {
          success: true,
          data: [],
          total_business_units: 0,
          total_tasks: 0,
        };
      }

      // STEP 3: Group by business unit using ALL tasks for module calculation
      const groupedByBusinessUnit = allTasks.reduce((acc, task) => {
        const businessUnitId = task.business_unit?.id;
        const businessUnitName = task.business_unit?.name;
        const siteId = task.site?.id;
        const moduleName =
          task.task_questions?.[0]?.question_sequence?.public_module_name;
        const { frequency } = task;
        const frequencyName = task.frequency_name;
        const isCompleted = task.status?.toLowerCase() === 'completed';

        if (!businessUnitId || !siteId) return acc;

        // Initialize business unit if not exists
        if (!acc[businessUnitId]) {
          acc[businessUnitId] = {
            business_unit_id: businessUnitId,
            business_unit_name: businessUnitName,
            sites: [],
            total_tasks: 0, // Will be calculated later based on filtered tasks
          };
        }

        // Find or create site
        let existingSite = acc[businessUnitId].sites.find(
          (site) => site.site_id === siteId,
        );

        if (!existingSite) {
          existingSite = {
            site_id: siteId,
            site_name: task.site?.name,
            location_name: task.site?.location || null,
            task_count: 0, // Will be calculated later based on filtered tasks
            modules: {}, // Store module tracking data
            total_module_count: 0,
            completed_module_count: 0,
          };
          acc[businessUnitId].sites.push(existingSite);
        }

        // Track modules and their completion by frequency_name (using ALL tasks)
        if (moduleName) {
          const moduleKey = moduleName;

          if (!existingSite.modules[moduleKey]) {
            existingSite.modules[moduleKey] = {
              module_name: moduleName,
              frequency,
              required_tasks: this.getRequiredTaskCount(frequency),
              frequency_tasks: {},
            };
          }

          if (frequencyName) {
            if (
              !existingSite.modules[moduleKey].frequency_tasks[frequencyName]
            ) {
              existingSite.modules[moduleKey].frequency_tasks[frequencyName] = {
                completed: false,
              };
            }

            if (isCompleted) {
              existingSite.modules[moduleKey].frequency_tasks[
                frequencyName
              ].completed = true;
            }
          }
        }

        return acc;
      }, {});

      // STEP 4: Calculate module counts for each site (based on ALL tasks)
      Object.values(groupedByBusinessUnit).forEach((businessUnit: any) => {
        businessUnit.sites.forEach((site: any) => {
          const moduleEntries = Object.entries(site.modules);
          site.total_module_count = moduleEntries.length;

          site.completed_module_count = moduleEntries.filter(
            ([_, moduleData]: [string, any]) => {
              const completedFrequencyTasks = Object.values(
                moduleData.frequency_tasks,
              ).filter((ft: any) => ft.completed).length;

              return completedFrequencyTasks >= moduleData.required_tasks;
            },
          ).length;

          // Remove the temporary modules object from response
          delete site.modules;
        });
      });

      // STEP 5: Apply status filter ONLY for task_count calculation
      let filteredTasks = allTasks;
      if (status && status.trim() !== '') {
        filteredTasks = allTasks.filter(
          (task) =>
            task.status &&
            task.status.toLowerCase().includes(status.toLowerCase()),
        );
      }

      // Count filtered tasks for task_count and total_tasks
      filteredTasks.forEach((task) => {
        const businessUnitId = task.business_unit?.id;
        const siteId = task.site?.id;

        if (businessUnitId && groupedByBusinessUnit[businessUnitId]) {
          groupedByBusinessUnit[businessUnitId].total_tasks += 1;

          const site = groupedByBusinessUnit[businessUnitId].sites.find(
            (s) => s.site_id === siteId,
          );
          if (site) {
            site.task_count += 1;
          }
        }
      });

      // STEP 6: Convert to array
      const formattedData = Object.values(groupedByBusinessUnit);

      return {
        success: true,
        data: formattedData,
        total_business_units: formattedData.length,
        total_tasks: filteredTasks.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch business units for datacube ${datacube_id}: ${error.message}`,
      );
    }
  }

  // Helper method to determine required task count based on frequency
  private getRequiredTaskCount(frequency: string): number {
    if (!frequency) return 1;

    const freq = frequency.toUpperCase();

    // Monthly frequency requires 12 tasks (one for each month)
    if (freq === 'MONTHLY') {
      return 12;
    }

    // Quarterly frequency requires 4 tasks (Q1, Q2, Q3, Q4)
    if (freq === 'QUARTERLY') {
      return 4;
    }

    // Yearly/Annual requires 1 task
    if (freq === 'YEARLY') {
      return 1;
    }

    // Default to 1
    return 1;
  }

  async getTasksByDatacubeAndSite(
    datacube_id: string,
    site_id: string,
    status?: string,
  ) {
    try {
      // STEP 1: Fetch all datacube frequencies for this datacube with tasks for the specific site
      const datacubeFrequencies = await this.dataCubeFrequencyModel.find({
        where: {
          datacube: { id: datacube_id },
        },
        relations: [
          'datacube',
          'task',
          'task.site',
          'task.data_provider',
          'task.data_reviewer',
          'task.task_questions',
          'task.task_questions.question_sequence',
        ],
      });

      if (!datacubeFrequencies || datacubeFrequencies.length === 0) {
        return {
          success: true,
          message: 'No datacube frequencies found',
          data: [],
          total: 0,
        };
      }

      // STEP 2: Extract and filter tasks by site_id, is_deleted, and optional status
      const allTasks = datacubeFrequencies.flatMap((frequency) =>
        frequency.task
          .filter((task) => {
            const matchesSite = task.site?.id === site_id;
            const notDeleted = !task.is_deleted;

            // Use the same status filtering logic as the first method
            const matchesStatus =
              status && status.trim() !== ''
                ? task.status?.toLowerCase().includes(status.toLowerCase())
                : true;

            return matchesSite && notDeleted && matchesStatus;
          })
          .map((task) => ({
            ...task,
            datacube_frequency: frequency,
            datacube: frequency.datacube,
          })),
      );

      if (allTasks.length === 0) {
        return {
          success: true,
          message: 'No tasks found for this datacube and site combination',
          data: [],
          total: 0,
        };
      }

      // STEP 3: Format the response data
      const formattedTasks = allTasks.map((task) => {
        // Get the first module name (single module per task)
        const moduleName =
          task.task_questions?.[0]?.question_sequence?.public_module_name ||
          null;

        const moduleId =
          task.task_questions?.[0]?.question_sequence?.public_module_id || null;

        return {
          task_id: task.id,
          task_status: task.status,
          datacube_id: task.datacube?.id || null,
          datacube_name: task.datacube?.name || null,
          frequency: task.datacube?.frequency || null,
          frequency_name: task.datacube_frequency?.frequency_name || null,
          site_id: task.site?.id || null,
          site_name: task.site?.name || null,
          module_id: moduleId,
          module_name: moduleName,
          template_yearly_file_url: task.template_yearly_file_url,
          data_provider: {
            id: task.data_provider?.id || null,
            name: task.data_provider?.name || null,
            email: task.data_provider?.email || null,
          },
          data_reviewer: {
            id: task.data_reviewer?.id || null,
            name: task.data_reviewer?.name || null,
            email: task.data_reviewer?.email || null,
          },
          created_at: task.createdAt,
          updated_at: task.updatedAt,
        };
      });

      return {
        success: true,
        data: formattedTasks,
        total: formattedTasks.length,
        datacube_id,
        site_id,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch tasks for datacube ${datacube_id} and site ${site_id}: ${error.message}`,
      );
    }
  }

  async getHomepageWidgetResponse(datacube_id: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const dashboard_item_ids = await this.datasource
        .getRepository(DashboardItem)
        .find({
          where: {
            is_homepage_dashboard: true,
          },
          select: ['id'],
        });

      const dashboard_item_ids_raw = dashboard_item_ids.map((w) => w.id);
      const analytics_chart_ids = await this.datasource
        .getRepository(WidgetItem)
        .find({
          where: {
            is_homepage_widget: true,
          },
          select: ['id'],
        });

      const results: any[] = [];

      // -------------------------
      // 1. Dashboard Widgets (cards/text)
      // -------------------------
      const combinedParams = await this.datasource.manager
        .getRepository(DashboardCombinedParameter)
        .find({
          where: { dashboard_item: { id: In(dashboard_item_ids_raw) } },
          relations: ['dashboard_item', 'dashboard_item.dashboard_type'],
          select: ['id', 'dashboard_item'],
        });

      if (combinedParams.length) {
        const customParams = await this.datasource.manager
          .getRepository(DashboardCustomParameter)
          .find({
            where: {
              dashboard_combined_parameter: In(combinedParams.map((c) => c.id)),
            },
            relations: [
              'dashboard_combined_parameter',
              'dashboard_combined_parameter.dashboard_item',
              'dashboard_combined_parameter.dashboard_item.dashboard_type',
            ],
            select: [
              'id',
              'questions',
              'macro_function',
              'dashboard_combined_parameter',
            ],
          });

        const [allFreqs, allSites] = await Promise.all([
          queryRunner.manager.getRepository(DataCubeFrequency).find({
            where: { datacube: { id: datacube_id } },
            select: ['id', 'frequency_name'],
          }),
          queryRunner.manager.getRepository(Site).find({ select: ['id'] }),
        ]);

        const freqIds = allFreqs.map((f) => f.id);
        const siteIds = allSites.map((s) => s.id);

        for (const cp of customParams) {
          const dashboardItem = cp.dashboard_combined_parameter.dashboard_item;
          const dashboardType = dashboardItem.dashboard_type;

          // Determine frequency filter
          let freqFilter: string[] = [];
          if (dashboardType.latest_data) {
            const latestFreq = allFreqs.find((f) =>
              /March|Q4/i.test(f.frequency_name),
            );
            if (latestFreq) freqFilter = [latestFreq.id];
          } else {
            freqFilter = freqIds;
          }

          // Fetch TaskQuestions
          const taskQuestions = await queryRunner.manager
            .getRepository(TaskQuestion)
            .find({
              where: {
                universal_question_id: In(cp.questions),
                datacube_frequency: In(freqFilter),
                site: In(siteIds),
              },
              select: ['id', 'universal_question_id'],
            });

          const tqIds = taskQuestions.map((tq) => tq.id);

          // Fetch TaskQuestionAnswers
          let answers: TaskQuestionAnswer[] = [];
          if (tqIds.length) {
            answers = await queryRunner.manager
              .getRepository(TaskQuestionAnswer)
              .find({
                where: { task_question: In(tqIds) },
                select: ['universal_question_id', 'answer'],
              });
          }

          // Build answer map
          const answerMap: Record<string, string[]> = {};
          for (const ans of answers) {
            const vals = Array.isArray(ans.answer)
              ? ans.answer.map(String)
              : [String(ans.answer ?? '')];
            if (!answerMap[ans.universal_question_id])
              answerMap[ans.universal_question_id] = [];
            answerMap[ans.universal_question_id].push(...vals);
          }

          // Calculate user-readable value
          let calculated_value: string | null = null;

          if (dashboardType.type === 'textArea') {
            const rawValues = cp.questions.flatMap((q) => answerMap[q] || []);
            calculated_value = rawValues.join(' ').trim() || null;
          } else {
            const rawValues = cp.questions.flatMap((q) => answerMap[q] || []);

            let sum = 0;
            let unitType: 'kg' | 'Tonnes' | 'rupees' | null = null;

            for (const val of rawValues) {
              const parts = val.includes(',') ? val.split(',') : val.split(' ');
              const num = parseFloat(parts[0]);
              if (!isNaN(num)) sum += num;
              if (parts.length > 1 && !unitType) {
                const u = parts[1].toLowerCase();
                if (u.includes('kg')) unitType = 'kg';
                else if (u.includes('tonne')) unitType = 'Tonnes';
                else if (u.includes('inr') || u.includes('rupee'))
                  unitType = 'rupees';
              }
            }

            if (unitType === 'kg') {
              sum /= 1000;
              unitType = 'Tonnes';
            }

            calculated_value =
              sum.toFixed(2) + (unitType ? ` ${unitType}` : '');
          }

          results.push({
            dashboard_item_id: dashboardItem.id,
            custom_parameter_id: cp.id,
            widget_type: dashboardType.type,
            macro_function: cp.macro_function,
            calculated_value,
          });
        }
      }

      // -------------------------
      // 2. Analytics Widgets (charts)
      // -------------------------
      if (analytics_chart_ids.length) {
        const analytics_chart_ids_raw = analytics_chart_ids.map((w) => w.id);
        const analyticsCustomParams = await this.datasource.manager
          .getRepository(CustomParameter)
          .find({
            where: {
              combined_parameter: {
                widget_item: { id: In(analytics_chart_ids_raw) },
              },
            },
            relations: [
              'combined_parameter',
              'combined_parameter.widget_item',
              'combined_parameter.widget_item.widget_type',
            ],
            select: ['id', 'questions', 'macro_function'],
          });

        if (analyticsCustomParams.length) {
          const [allFreqs, allSites] = await Promise.all([
            queryRunner.manager.getRepository(DataCubeFrequency).find({
              where: { datacube: { id: datacube_id } },
              select: ['id'],
            }),
            queryRunner.manager.getRepository(Site).find({ select: ['id'] }),
          ]);

          const freqIds = allFreqs.map((f) => f.id);
          const siteIds = allSites.map((s) => s.id);
          const processedCombinedParams = new Set<string>();

          for (const cp of analyticsCustomParams) {
            const widgetType =
              cp.combined_parameter?.widget_item?.widget_type?.type ||
              'unknown';

            // Frequency filter → all for homepage
            const freqFilter = In(freqIds);

            // Fetch TaskQuestions
            const taskQuestions = await queryRunner.manager
              .getRepository(TaskQuestion)
              .find({
                where: {
                  universal_question_id: In(cp.questions),
                  datacube_frequency: freqFilter,
                  site: In(siteIds),
                },
                select: ['id', 'universal_question_id'],
              });

            const tqIds = taskQuestions.map((tq) => tq.id);

            // Fetch TaskQuestionAnswers
            let answers: TaskQuestionAnswer[] = [];
            if (tqIds.length) {
              answers = await queryRunner.manager
                .getRepository(TaskQuestionAnswer)
                .find({
                  where: { task_question: In(tqIds) },
                  select: ['universal_question_id', 'answer'],
                });
            }

            // Build answer map
            const answerMap: Record<string, string[]> = {};
            for (const ans of answers) {
              const vals = Array.isArray(ans.answer)
                ? ans.answer.map(String)
                : [String(ans.answer ?? '')];
              if (!answerMap[ans.universal_question_id])
                answerMap[ans.universal_question_id] = [];
              answerMap[ans.universal_question_id].push(...vals);
            }

            // Process chart (only once per combined_parameter)
            if (
              widgetType === 'chart' &&
              !processedCombinedParams.has(cp.combined_parameter.id)
            ) {
              processedCombinedParams.add(cp.combined_parameter.id);
              const chartResult = await this.processChart(
                cp,
                'chart',
                datacube_id,
                'all',
                'all',
              );
              results.push(chartResult);
            }
          }
        }
      }

      return { success: true, response: results };
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? error);
    } finally {
      await queryRunner.release();
    }
  }

  async getResponseByDatacube(datacube_id: string, widget_id: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const widget: any = await this.datasource.manager
        .getRepository(Widget)
        .findOne({
          where: { id: widget_id },
          relations: WIDGET_RELATIONS.map((relation) => relation.path),
        });
      if (!widget) throw new BadRequestException('Invalid widget');

      const widget_questions = widget.widget_blocks.flatMap((block) =>
        block.widget_columns.flatMap((column) =>
          column.widget_types.flatMap((type) =>
            type.widget_item.flatMap((item) => item.question),
          ),
        ),
      );
      const macroFunction = widget.widget_blocks.flatMap((block) =>
        block.widget_columns.flatMap((column) =>
          column.widget_types.flatMap((type) =>
            type.widget_item.flatMap((item) => item.macro_function),
          ),
        ),
      );

      // Get task responses for each widget question
      const taskResponses = await Promise.all(
        widget_questions.map(async (question) => {
          const datacube_question = await queryRunner.manager
            .getRepository(DataCubeQuestion)
            .findOne({
              where: {
                public_question_id: question,
              },
            });

          const task_question = await queryRunner.manager
            .getRepository(TaskQuestionAnswer)
            .findOne({
              where: { datacube_question: { id: datacube_question.id } },
              relations: ['datacube_question'],
            });
          return task_question;
        }),
      );
      const answers = widget_questions.map((questionId) => {
        const response = taskResponses.find(
          (response) =>
            response.datacube_question.public_question_id === questionId,
        );
        return response?.answer || '0';
      });

      // Create a mapping of question IDs to their answers
      const answerMap = {};
      widget_questions.forEach((questionId, index) => {
        answerMap[questionId] = answers[index];
      });

      // Replace question IDs with their answer values in the formula
      let calculation = macroFunction[0];
      Object.entries(answerMap).forEach(([questionId, answer]) => {
        // Use regex to match the full question ID
        const regex = new RegExp(questionId, 'g');
        calculation = calculation.replace(regex, String(answer));
      });

      const answer = taskResponses.map((response) => {
        if (!calculation || !response?.answer) return 0;

        try {
          // Evaluate the calculation with numeric values
          return Function(`"use strict";return (${calculation})`)();
        } catch (err) {
          throw new BadRequestException(
            `Error evaluating formula ${calculation}:`,
            err,
          );
          // return 0;
        }
      });
      // const datacube = await this.datacubeModel.findOne({
      //   where: { id: datacube_id },
      //   relations: DATA_CUBE_RELATIONS.map((relation) => relation.path),
      // });
      // if (!datacube) throw new BadRequestException('Invalid datacube');
      return {
        success: true,
        widget,
        taskResponses,
        answer,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async _getResponseByDatacube(datacube_id: string, widget_id: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const widget: any = await this.datasource.manager
        .getRepository(Widget)
        .findOne({
          where: { id: widget_id },
          relations: WIDGET_RELATIONS.map((relation) => relation.path),
        });
      if (!widget) throw new BadRequestException('Invalid widget');

      // Process each block, column, widget type and item
      const processedBlocks = await Promise.all(
        widget.widget_blocks.map(async (block) => {
          const processedColumns = await Promise.all(
            block.widget_columns.map(async (column) => {
              const processedTypes = await Promise.all(
                column.widget_types.map(async (type) => {
                  const processedItems = await Promise.all(
                    type.widget_item.map(async (item) => {
                      const processedCombinedParams = await Promise.all(
                        item.combined_parameters.map(async (combinedParam) => {
                          const processedCustomParams = await Promise.all(
                            combinedParam.custom_parameter.map(
                              async (customParam) => {
                                // Get questions for this custom parameter
                                const questions = customParam.questions || [];

                                // Get task responses for each question
                                const taskResponses = await Promise.all(
                                  questions.map(async (questionId) => {
                                    const datacube_question =
                                      await queryRunner.manager
                                        .getRepository(DataCubeQuestion)
                                        .findOne({
                                          where: {
                                            public_question_id: questionId,
                                          },
                                        });

                                    const task_question =
                                      await queryRunner.manager
                                        .getRepository(TaskQuestionAnswer)
                                        .findOne({
                                          where: {
                                            datacube_question: {
                                              id: datacube_question?.id,
                                            },
                                          },
                                          relations: [
                                            'datacube_question',
                                            'datacube_question.datacube_question_options',
                                          ],
                                        });
                                    return task_question;
                                  }),
                                );

                                // Create answer map for this custom parameter's questions
                                const answerMap = {};
                                questions.forEach((questionId, index) => {
                                  const response = taskResponses[index];
                                  answerMap[questionId] =
                                    response?.answer || '0';
                                });

                                // Process macro function if exists
                                let paramResult = null;
                                if (customParam.macro_function) {
                                  let calculation = customParam.macro_function;
                                  Object.entries(answerMap).forEach(
                                    ([questionId, answer]) => {
                                      const regex = new RegExp(questionId, 'g');
                                      calculation = calculation.replace(
                                        regex,
                                        String(answer),
                                      );
                                    },
                                  );

                                  try {
                                    paramResult = Function(
                                      `"use strict";return (${calculation})`,
                                    )();
                                  } catch (err) {
                                    throw new BadRequestException(
                                      `Error evaluating formula ${calculation}:`,
                                      err,
                                    );
                                  }
                                }

                                return {
                                  param_id: customParam.id,
                                  name: customParam.name,
                                  questions,
                                  taskResponses,
                                  macro_function: customParam.macro_function,
                                  unit: customParam.unit,
                                  legends: customParam.legends,
                                  label: customParam.label,
                                  result: paramResult,
                                };
                              },
                            ),
                          );

                          return {
                            combined_id: combinedParam.id,
                            name: combinedParam.name,
                            custom_parameters: processedCustomParams,
                          };
                        }),
                      );

                      return {
                        item_id: item.id,
                        title: item.title,
                        filter: item.filter,
                        combined_parameters: processedCombinedParams,
                      };
                    }),
                  );

                  return {
                    type_id: type.id,
                    type: type.type,
                    chart_type: type.chart_type,
                    is_stacked: type.is_stacked,
                    is_horizontal: type.is_horizontal,
                    is_metric: type.is_metric,
                    items: processedItems,
                  };
                }),
              );

              return {
                column_id: column.id,
                types: processedTypes,
              };
            }),
          );

          return {
            block_id: block.id,
            columns: processedColumns,
          };
        }),
      );

      return {
        success: true,
        processed_blocks: processedBlocks,
      };
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getAnalyticsResponse(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    queryRunner.connect();
    try {
      // 1. Get all widgets from admin (all widgets in the system)
      const widgets = await this.datasource.manager.getRepository(Widget).find({
        relations: WIDGET_RELATIONS.map((relation) => relation.path),
      });

      if (!widgets || widgets.length === 0) {
        throw new BadRequestException('No widgets found');
      }

      // 2. Group widgets by module id
      const modulesMap: Record<string, ModuleData> = {};
      widgets.forEach((widget) => {
        const moduleId = widget.module?.id;
        if (moduleId) {
          if (!modulesMap[moduleId]) {
            modulesMap[moduleId] = {
              module_id: moduleId,
              module_name: widget.module?.name,
              widgets: [],
              indicators: {},
            };
          }
          modulesMap[moduleId].widgets.push(widget);

          // Group indicators for this module
          const indicatorId = widget.indicator?.id;
          const indicatorName = widget.indicator?.name;
          if (indicatorId) {
            if (!modulesMap[moduleId].indicators[indicatorId]) {
              modulesMap[moduleId].indicators[indicatorId] = {
                indicator_name: indicatorName,
                widgets: [],
              };
            }
            modulesMap[moduleId].indicators[indicatorId].widgets.push(widget);
          }
        }
      });

      // 3. For each module, process widgets and group indicators
      const modules = await Promise.all(
        Object.values(modulesMap).map(async (moduleObj: ModuleData) => {
          // For each indicator in this module
          const indicators = await Promise.all(
            Object.entries(moduleObj.indicators).map(
              async ([indicator_id, indicatorData]: [
                string,
                IndicatorData,
              ]) => {
                // For each widget in this indicator
                const widgetResponses = await Promise.all(
                  indicatorData.widgets.map(async (widget: any) => {
                    // For each block, column, type, item, process as in _getResponseByDatacube
                    const processedBlocks = await Promise.all(
                      (Array.isArray(widget.widget_blocks)
                        ? widget.widget_blocks
                        : []
                      ).map(async (block: any) => {
                        const processedColumns = await Promise.all(
                          (Array.isArray(block.widget_columns)
                            ? block.widget_columns
                            : []
                          ).map(async (column) => {
                            const processedTypes = await Promise.all(
                              (Array.isArray(column.widget_types)
                                ? column.widget_types
                                : []
                              ).map(async (type) => {
                                const processedItems = await Promise.all(
                                  (Array.isArray(type.widget_item)
                                    ? type.widget_item
                                    : []
                                  ).map(async (item) => {
                                    const processedCombinedParams =
                                      await Promise.all(
                                        (Array.isArray(item.combined_parameters)
                                          ? item.combined_parameters
                                          : []
                                        ).map(async (combinedParam) => {
                                          const processedCustomParams =
                                            await Promise.all(
                                              (Array.isArray(
                                                combinedParam.custom_parameter,
                                              )
                                                ? combinedParam.custom_parameter
                                                : []
                                              ).map(async (customParam) => {
                                                // Get questions for this custom parameter
                                                const questions =
                                                  customParam.questions || [];

                                                // Get task responses for each question
                                                const taskResponses =
                                                  await Promise.all(
                                                    questions.map(
                                                      async (questionId) => {
                                                        // Fix: Use correct table name and check for entity existence
                                                        const datacube_question =
                                                          await queryRunner.manager
                                                            .getRepository(
                                                              DataCubeQuestion,
                                                            )
                                                            .findOne({
                                                              where: {
                                                                public_question_id:
                                                                  questionId,
                                                                datacube: {
                                                                  id: datacube_id,
                                                                },
                                                              },
                                                              // relations: ['datacube_question_options']
                                                            });
                                                        if (
                                                          !datacube_question
                                                        ) {
                                                          throw new BadRequestException(
                                                            `Datacube question with public_question_id ${questionId} not found`,
                                                          );
                                                        }
                                                        const task_question =
                                                          await queryRunner.manager
                                                            .getRepository(
                                                              TaskQuestionAnswer,
                                                            )
                                                            .findOne({
                                                              where: {
                                                                datacube_question:
                                                                  {
                                                                    id: datacube_question?.id,
                                                                  },
                                                                task_question: {
                                                                  datacube_frequency:
                                                                    frequency_id,
                                                                  site: site_id,
                                                                },
                                                              },
                                                              relations: [
                                                                // 'datacube_question',
                                                                'datacube_question.datacube_question_options',
                                                                'datacube_question.mixed_questions',
                                                              ],
                                                            });

                                                        return {
                                                          task_response:
                                                            task_question,
                                                          // question: datacube_question,
                                                          options:
                                                            datacube_question.datacube_question_options,
                                                        };
                                                      },
                                                    ),
                                                  );

                                                let answer;
                                                if (
                                                  customParam.macro_function &&
                                                  customParam.macro_function
                                                    .length > 0
                                                ) {
                                                  // Macro function exists, do calculation
                                                  const answers = questions.map(
                                                    (questionId, idx) => {
                                                      const response =
                                                        taskResponses[idx]
                                                          ?.task_response;
                                                      return (
                                                        response?.answer || '0'
                                                      ); // Default to '0' if no answer
                                                    },
                                                  );

                                                  // Create a map of question IDs to their answers
                                                  const answerMap = {};
                                                  questions.forEach(
                                                    (questionId, idx) => {
                                                      answerMap[questionId] =
                                                        answers[idx];
                                                    },
                                                  );

                                                  // Get the macro function formula
                                                  let calculation =
                                                    customParam.macro_function;

                                                  // Replace question IDs with their values in the formula
                                                  Object.entries(
                                                    answerMap,
                                                  ).forEach(
                                                    ([questionId, ans]) => {
                                                      calculation =
                                                        calculation.replace(
                                                          questionId,
                                                          String(ans),
                                                        );
                                                    },
                                                  );

                                                  try {
                                                    // Add validation to ensure calculation is a valid mathematical expression
                                                    if (
                                                      !/^[0-9+\-*/().\s]+$/.test(
                                                        calculation,
                                                      )
                                                    ) {
                                                      throw new Error(
                                                        'Invalid mathematical expression',
                                                      );
                                                    }
                                                    answer = Function(
                                                      `"use strict";return (${calculation})`,
                                                    )();
                                                  } catch (err) {
                                                    console.error(
                                                      `Error evaluating formula ${calculation}:`,
                                                      err,
                                                    );
                                                    answer = 0;
                                                  }
                                                } else {
                                                  // No macro function, just return the answer(s)
                                                  answer = taskResponses.map(
                                                    (response) =>
                                                      response?.task_response
                                                        ?.answer,
                                                  );
                                                }
                                                return {
                                                  ...customParam,
                                                  answer,
                                                  task_responses: taskResponses,
                                                };
                                              }),
                                            );
                                          return {
                                            ...combinedParam,
                                            custom_parameter:
                                              processedCustomParams,
                                          };
                                        }),
                                      );
                                    return {
                                      item_id: item.id,
                                      title: item.title,
                                      filter: item.filter,
                                      combined_parameters:
                                        processedCombinedParams,
                                    };
                                  }),
                                );
                                return {
                                  type_id: type.id,
                                  type: type.type,
                                  chart_type: type.chart_type,
                                  is_stacked: type.is_stacked,
                                  is_horizontal: type.is_horizontal,
                                  is_metric: type.is_metric,
                                  items: processedItems,
                                };
                              }),
                            );
                            return {
                              column_id: column,
                              types: processedTypes,
                            };
                          }),
                        );
                        return {
                          block_id: block,
                          columns: processedColumns,
                        };
                      }),
                    );
                    return {
                      widget_id: widget,
                      title: widget.title,
                      processed_blocks: processedBlocks,
                    };
                  }),
                );
                return {
                  indicator_id,
                  indicator_name: indicatorData.indicator_name,
                  widgets: widgetResponses,
                };
              },
            ),
          );
          return {
            module_id: moduleObj.module_id,
            module_name: moduleObj.module_name,
            indicators,
          };
        }),
      );
      return {
        success: true,
        modules,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getAnalyticsTimeSeriesResponse(
    datacube_id: string,
    site_id: string,
    widget_id: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // Public DB connection for CustomParameter
    // const publicDataSource = await AppDataSource.initialize();

    try {
      const widgetId = await this.datasource.manager
        .getRepository(Widget)
        .findOne({
          where: { id: widget_id },
        });

      if (!widgetId) {
        throw new BadRequestException('Widget not found');
      }
      // 1. Get all widget parameter blocks
      const customParams = await this.datasource.manager
        .getRepository(CustomParameter)
        .find({
          where: {
            widget_id: widgetId.id,
            combined_parameter: {
              widget_item: { widget_type: { is_time_series: true } },
            },
          },
          select: ['id', 'widget_id', 'questions', 'macro_function', 'unit'],
        });

      if (!customParams.length) {
        return { success: true, response: [] };
      }

      // ---------------- 1b. Reverse Lookup for Group Questions ----------------
      // Identify valid UIDs from all custom parameters
      const allUIDs = [
        ...new Set(customParams.flatMap((cp) => cp.questions || [])),
      ];
      const expandedUIDs = new Set(allUIDs);

      if (allUIDs.length > 0) {
        // Check datacube_group_questions table directly
        const groupQuestionsDirectCheck = await queryRunner.manager
          .getRepository(DataCubeGroupQuestions)
          .createQueryBuilder('gq')
          .leftJoinAndSelect('gq.group_question_rule', 'gqr')
          .where('gq.universal_question_id IN (:...allUIDs)', { allUIDs })
          .getMany();

        if (groupQuestionsDirectCheck.length > 0) {
          // Extract rule IDs
          const ruleIds = groupQuestionsDirectCheck
            .map((gq) => gq.group_question_rule?.id)
            .filter((id) => !!id);

          if (ruleIds.length > 0) {
            const uniqueRuleIds = [...new Set(ruleIds)];

            // Find Parent QuestionSequences in THIS datacube that use these group rules
            const parentSequences = await queryRunner.manager
              .getRepository(DataCubeQuestionSequences)
              .find({
                where: {
                  datacube: { id: datacube_id },
                  group_question_rule: { id: In(uniqueRuleIds) },
                },
                select: ['universal_question_id'],
              });

            if (parentSequences.length > 0) {
              // Add parents to expanded list so we can find their TaskQuestions
              parentSequences.forEach((ps) =>
                expandedUIDs.add(ps.universal_question_id),
              );
            }
          }
        }
      }
      const expandedUIDsArray = Array.from(expandedUIDs);

      // ---------------- 2. Get datacube_frequency IDs once ----------------
      let dcFreqIds: string[] = [];
      const matchingDcFreqIds = await queryRunner.manager
        .getRepository(DataCubeFrequency)
        .find({
          where: { datacube: { id: datacube_id } },
          select: ['id', 'frequency_name'],
        });
      dcFreqIds = matchingDcFreqIds.map((dcf) => dcf.id);
      const results = {};

      // Initialize results structure grouped by custom parameter ID
      customParams.forEach((cp) => {
        results[cp.id] = {
          custom_param_id: cp.id,
          widget_id: cp.widget_id,
          macro_function: cp.macro_function,
          unit: cp.unit,
          frequency_data: [],
        };
      });

      await Promise.all(
        matchingDcFreqIds.map(async (freqDetail) => {
          if (site_id !== 'all') {
            if (!dcFreqIds.length) {
              return {
                success: true,
                response: customParams.map((cp) => ({
                  widget_id: cp.widget_id,
                  macro_function: cp.macro_function,
                  calculated_value: null,
                })),
              };
            }
          }

          // ---------------- 3. Get TaskQuestions for current frequency ----------------
          let allTaskQuestions: TaskQuestion[] = [];
          const tqWhere: any = {
            universal_question_id: In(expandedUIDsArray),
            datacube_frequency: freqDetail.id, // Filter by current frequency
          };
          if (site_id !== 'all') tqWhere.site = site_id;

          allTaskQuestions = await queryRunner.manager
            .getRepository(TaskQuestion)
            .find({
              where: tqWhere,
              select: ['id', 'universal_question_id'],
            });
          const taskQuestionIds = allTaskQuestions.map((tq) => tq.id);

          // ---------------- 4. Get TaskQuestionAnswers for current frequency ----------------
          const allAnswers = await queryRunner.manager
            .getRepository(TaskQuestionAnswer)
            .find({
              where: taskQuestionIds.length
                ? { task_question: In(taskQuestionIds) }
                : {
                    universal_question_id: In(expandedUIDsArray),
                  },
              select: ['task_question', 'universal_question_id', 'answer'],
            });

          // ---------------- 5. Collect UUIDs once ----------------
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const possibleUuids = new Set<string>();
          for (const ans of allAnswers) {
            const values = Array.isArray(ans.answer)
              ? ans.answer.map((v) => String(v ?? ''))
              : [String(ans.answer ?? '')];
            values.forEach((v) => {
              if (uuidRegex.test(v)) {
                possibleUuids.add(v);
              }
            });
          }

          // ---------------- 6. Fetch UUID replacements once ----------------
          const uuidMap: Record<string, string> = {};
          if (possibleUuids.size) {
            const options = await queryRunner.manager
              .getRepository(DataCubeQuestionOption)
              .find({
                where: { id: In([...possibleUuids]) },
                select: ['id', 'text'],
              });
            options.forEach((o) => {
              uuidMap[o.id] = o.text;
            });
          }

          // ---------------- 7. Build answerMap for quick lookup ----------------
          const answerMap: Record<string, string[]> = {};
          for (const ans of allAnswers) {
            const qId = ans.universal_question_id;
            const values = Array.isArray(ans.answer)
              ? ans.answer.map((v) => String(v ?? ''))
              : [String(ans.answer ?? '')];
            const replacedValues = values.map((v) =>
              uuidRegex.test(v) ? (uuidMap[v] ?? v) : v,
            );

            if (!answerMap[qId]) answerMap[qId] = [];
            answerMap[qId].push(...replacedValues);
          }

          // ---------------- 8. Process results ----------------
          customParams.forEach((cp) => {
            const qIds = cp.questions;
            const isNumeric = qIds.every((qId) =>
              (answerMap[qId] || []).every((val) => !isNaN(Number(val))),
            );
            const isMixed = qIds.some((qId) =>
              (answerMap[qId] || []).some((val) => val.includes(',')),
            );

            let calculatedValue: string | number = '';
            if (isMixed) {
              const parts = qIds.map((qId) => {
                const vals = answerMap[qId] || [];
                return vals.map((val) => {
                  const [num, unit] = val.split(',');
                  return { num: Number(num) || 0, unit: unit || '' };
                });
              });

              let expr = cp.macro_function || '';
              qIds.forEach((qId, idx) => {
                // If site_id is not 'all', don't sum across frequencies - use individual values
                const numSum =
                  site_id === 'all'
                    ? parts[idx].reduce((a, b) => a + b.num, 0)
                    : parts[idx].length > 0
                      ? parts[idx][0].num
                      : 0;
                expr = expr.replace(new RegExp(qId, 'g'), String(numSum));
              });

              let numericResult = 0;
              try {
                numericResult = eval(expr);
              } catch {
                numericResult = 0;
              }
              const firstUnit =
                parts.find((p) => p.length && p[0].unit)?.[0].unit || '';
              calculatedValue = `${Number(numericResult)},${firstUnit}`;
            } else if (isNumeric) {
              let expr = cp.macro_function || '';
              qIds.forEach((qId) => {
                // If site_id is not 'all', don't sum across frequencies - use individual values
                const sumValue =
                  site_id === 'all'
                    ? (answerMap[qId] || []).reduce(
                        (a, b) => a + Number(b || 0),
                        0,
                      )
                    : (answerMap[qId] || []).length > 0
                      ? Number(answerMap[qId][0] || 0)
                      : 0;
                expr = expr.replace(new RegExp(qId, 'g'), String(sumValue));
              });

              try {
                const result = eval(expr);
                calculatedValue = Number(result);
              } catch {
                calculatedValue = 0;
              }
            } else {
              // For non-numeric values, join all values if site_id is 'all', otherwise use first value
              calculatedValue =
                site_id === 'all'
                  ? qIds.flatMap((qId) => answerMap[qId] || []).join(' ')
                  : qIds
                      .map((qId) => (answerMap[qId] || [])[0] || '')
                      .join(' ');
            }

            // Add frequency data to the grouped result
            results[cp.id].frequency_data.push({
              calculated_value: calculatedValue || null,
              frequency_name: freqDetail.frequency_name
                ? freqDetail.frequency_name.split('_')[0]
                : null,
              frequency_year: freqDetail.frequency_name
                ? freqDetail.frequency_name.split('_')[1]
                : null,
            });
          });
        }),
      );
      return { success: true, response: Object.values(results) };
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? error);
    } finally {
      await queryRunner.release();
      // await publicDataSource.destroy();
    }
  }

  async getDashboardTimeSeriesResponse(
    datacube_id: string,
    site_id: string,
    dashboard_id: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // Public DB connection for CustomParameter
    // const publicDataSource = await AppDataSource.initialize();

    try {
      const dashboardId = await this.datasource.manager
        .getRepository(Dashboard)
        .findOne({
          where: { id: dashboard_id },
        });

      if (!dashboardId) {
        throw new BadRequestException('Dashboard not found');
      }
      // 1. Get all widget parameter blocks
      const customParams = await this.datasource.manager
        .getRepository(DashboardCustomParameter)
        .find({
          where: {
            dashboard_id: dashboardId.id,
            dashboard_combined_parameter: {
              dashboard_item: { dashboard_type: { is_time_series: true } },
            },
          },
          select: ['id', 'dashboard_id', 'questions', 'macro_function', 'unit'],
        });

      if (!customParams.length) {
        return { success: true, response: [] };
      }

      // ---------------- 2. Get datacube_frequency IDs once ----------------
      let dcFreqIds: string[] = [];
      const matchingDcFreqIds = await queryRunner.manager
        .getRepository(DataCubeFrequency)
        .find({
          where: { datacube: { id: datacube_id } },
          select: ['id', 'frequency_name'],
        });
      dcFreqIds = matchingDcFreqIds.map((dcf) => dcf.id);
      const results = {};

      // Initialize results structure grouped by custom parameter ID
      customParams.forEach((cp) => {
        results[cp.id] = {
          custom_param_id: cp.id,
          dashboard_id: cp.dashboard_id,
          macro_function: cp.macro_function,
          unit: cp.unit,
          frequency_data: [],
        };
      });

      await Promise.all(
        matchingDcFreqIds.map(async (freqDetail) => {
          if (site_id !== 'all') {
            if (!dcFreqIds.length) {
              return {
                success: true,
                response: customParams.map((cp) => ({
                  dashboard_id: cp.dashboard_id,
                  macro_function: cp.macro_function,
                  calculated_value: null,
                })),
              };
            }
          }

          // ---------------- 3. Get TaskQuestions for current frequency ----------------
          let allTaskQuestions: TaskQuestion[] = [];
          const tqWhere: any = {
            universal_question_id: In(
              customParams.flatMap((cp) => cp.questions),
            ),
            datacube_frequency: freqDetail.id, // Filter by current frequency
          };
          if (site_id !== 'all') tqWhere.site = site_id;

          allTaskQuestions = await queryRunner.manager
            .getRepository(TaskQuestion)
            .find({
              where: tqWhere,
              select: ['id', 'universal_question_id'],
            });
          const taskQuestionIds = allTaskQuestions.map((tq) => tq.id);

          // ---------------- 4. Get all TaskQuestionAnswers once ----------------
          const allAnswers = await queryRunner.manager
            .getRepository(TaskQuestionAnswer)
            .find({
              where: taskQuestionIds.length
                ? { task_question: In(taskQuestionIds) }
                : {
                    universal_question_id: In(
                      customParams.flatMap((cp) => cp.questions),
                    ),
                  },
              select: ['task_question', 'universal_question_id', 'answer'],
            });

          // ---------------- 5. Collect UUIDs once ----------------
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const possibleUuids = new Set<string>();
          for (const ans of allAnswers) {
            const values = Array.isArray(ans.answer)
              ? ans.answer.map((v) => String(v ?? ''))
              : [String(ans.answer ?? '')];
            values.forEach((v) => {
              if (uuidRegex.test(v)) {
                possibleUuids.add(v);
              }
            });
          }

          // ---------------- 6. Fetch UUID replacements once ----------------
          const uuidMap: Record<string, string> = {};
          if (possibleUuids.size) {
            const options = await queryRunner.manager
              .getRepository(DataCubeQuestionOption)
              .find({
                where: { id: In([...possibleUuids]) },
                select: ['id', 'text'],
              });
            options.forEach((o) => {
              uuidMap[o.id] = o.text;
            });
          }

          // ---------------- 7. Build answerMap for quick lookup ----------------
          const answerMap: Record<string, string[]> = {};
          for (const ans of allAnswers) {
            const qId = ans.universal_question_id;
            const values = Array.isArray(ans.answer)
              ? ans.answer.map((v) => String(v ?? ''))
              : [String(ans.answer ?? '')];
            const replacedValues = values.map((v) =>
              uuidRegex.test(v) ? (uuidMap[v] ?? v) : v,
            );

            if (!answerMap[qId]) answerMap[qId] = [];
            answerMap[qId].push(...replacedValues);
          }

          // ---------------- 8. Process results ----------------
          customParams.forEach((cp) => {
            const qIds = cp.questions;
            const isNumeric = qIds.every((qId) =>
              (answerMap[qId] || []).every((val) => !isNaN(Number(val))),
            );
            const isMixed = qIds.some((qId) =>
              (answerMap[qId] || []).some((val) => val.includes(',')),
            );

            let calculatedValue: string | number = '';
            if (isMixed) {
              const parts = qIds.map((qId) => {
                const vals = answerMap[qId] || [];
                return vals.map((val) => {
                  const [num, unit] = val.split(',');
                  return { num: Number(num) || 0, unit: unit || '' };
                });
              });

              let expr = cp.macro_function || '';
              qIds.forEach((qId, idx) => {
                // If site_id is not 'all', don't sum across frequencies - use individual values
                const numSum =
                  site_id === 'all'
                    ? parts[idx].reduce((a, b) => a + b.num, 0)
                    : parts[idx].length > 0
                      ? parts[idx][0].num
                      : 0;
                expr = expr.replace(new RegExp(qId, 'g'), String(numSum));
              });

              let numericResult = 0;
              try {
                numericResult = eval(expr);
              } catch {
                numericResult = 0;
              }
              const firstUnit =
                parts.find((p) => p.length && p[0].unit)?.[0].unit || '';
              calculatedValue = `${Number(numericResult)},${firstUnit}`;
            } else if (isNumeric) {
              let expr = cp.macro_function || '';
              qIds.forEach((qId) => {
                // If site_id is not 'all', don't sum across frequencies - use individual values
                const sumValue =
                  site_id === 'all'
                    ? (answerMap[qId] || []).reduce(
                        (a, b) => a + Number(b || 0),
                        0,
                      )
                    : (answerMap[qId] || []).length > 0
                      ? Number(answerMap[qId][0] || 0)
                      : 0;
                expr = expr.replace(new RegExp(qId, 'g'), String(sumValue));
              });

              try {
                const result = eval(expr);
                calculatedValue = Number(result);
              } catch {
                calculatedValue = 0;
              }
            } else {
              // For non-numeric values, join all values if site_id is 'all', otherwise use first value
              calculatedValue =
                site_id === 'all'
                  ? qIds.flatMap((qId) => answerMap[qId] || []).join(' ')
                  : qIds
                      .map((qId) => (answerMap[qId] || [])[0] || '')
                      .join(' ');
            }

            // Add frequency data to the grouped result
            results[cp.id].frequency_data.push({
              calculated_value: calculatedValue || null,
              frequency_name: freqDetail.frequency_name
                ? freqDetail.frequency_name.split('_')[0]
                : null,
              frequency_year: freqDetail.frequency_name
                ? freqDetail.frequency_name.split('_')[1]
                : null,
            });
          });
        }),
      );
      return { success: true, response: Object.values(results) };
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? error);
    } finally {
      await queryRunner.release();
      // await publicDataSource.destroy();
    }
  }

  async getAnalyticsResponseByWidget(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
    widget_id?: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    // const publicDataSource = await AppDataSource.initialize();

    try {
      // 1. Fetch widget parameters
      const customParams = await this.datasource.manager
        .getRepository(CustomParameter)
        .find({
          where: widget_id ? { widget_id } : {},
          relations: [
            'combined_parameter',
            'combined_parameter.widget_item',
            'combined_parameter.widget_item.widget_type',
          ],
          select: ['id', 'widget_id', 'questions', 'macro_function'],
        });

      if (!customParams.length) {
        return { success: true, response: [] };
      }

      // 2. Map widget types
      const widgetTypeMap: Record<string, string> = {};
      const latestDataMap: Record<string, boolean> = {};

      customParams.forEach((cp) => {
        const typeEntity =
          cp.combined_parameter?.widget_item?.widget_type?.type;
        widgetTypeMap[cp.id] = this.normalizeWidgetType(typeEntity);

        const latest =
          cp.combined_parameter?.widget_item?.widget_type?.latest_data ?? false;
        latestDataMap[cp.id] = latest;
      });

      // -------------------------
      // 3. ALWAYS pre-fetch datacube frequency IDs (must scope to this datacube)
      // -------------------------
      const matchingDcFreqIds = await queryRunner.manager
        .getRepository(DataCubeFrequency)
        .find({
          where: { datacube: { id: datacube_id } },
          select: ['id'],
        });
      const dcFreqIds = matchingDcFreqIds.map((dcf) => dcf.id);

      // If datacube has no frequencies, nothing to compute for this datacube.
      if (!dcFreqIds.length) {
        return {
          success: true,
          response: customParams.map((cp) => ({
            custom_parameter_id: cp.id,
            widget_id: cp.widget_id,
            widget_type: widgetTypeMap[cp.id] || 'unknown',
            macro_function: cp.macro_function,
            calculated_value: null,
          })),
        };
      }

      // 6. UUID replacement map
      const uuidRegex = /^[0-9a-f-]{36}$/i;
      const uuidMap: Record<string, string> = {};

      // 8. Process responses
      const results = [];
      const processedCombinedParams = new Set<string>();
      for (const cp of customParams) {
        const widgetType = widgetTypeMap[cp.id] || 'unknown';
        const latestData =
          cp.combined_parameter?.widget_item?.widget_type?.latest_data;

        // -------------------------
        // Pick frequency (per CP)
        // -------------------------
        let freqFilter: string | string[];

        if (latestData) {
          // find latest frequency (e.g., March or Q4)
          const latestFreq = await queryRunner.manager
            .getRepository(DataCubeFrequency)
            .findOne({
              where: [
                {
                  datacube: { id: datacube_id },
                  frequency_name: Like('%March_%'),
                },
                { datacube: { id: datacube_id }, frequency_name: Like('%Q4%') },
              ],
              select: ['id'],
            });
          freqFilter = latestFreq?.id;
        } else if (frequency_id !== 'all') {
          freqFilter = frequency_id;
        } else {
          freqFilter = dcFreqIds;
        }

        const answerMap: Record<string, string[]> = {};
        if (widgetType !== 'table' && widgetType !== 'chart') {
          // -------------------------
          // Fetch TaskQuestions for this CP
          // -------------------------
          const tqWhere: any = {
            universal_question_id: In(cp.questions),
            datacube_frequency: Array.isArray(freqFilter)
              ? In(freqFilter)
              : freqFilter,
          };
          if (site_id !== 'all') tqWhere.site = site_id;

          const taskQuestions = await queryRunner.manager
            .getRepository(TaskQuestion)
            .find({
              where: tqWhere,
              select: ['id', 'universal_question_id'],
            });

          const taskQuestionIds = taskQuestions.map((tq) => tq.id);

          // -------------------------
          // Fetch answers for this CP
          // -------------------------
          let cpAnswers: TaskQuestionAnswer[] = [];
          if (taskQuestionIds.length) {
            cpAnswers = await queryRunner.manager
              .getRepository(TaskQuestionAnswer)
              .find({
                where: { task_question: In(taskQuestionIds) },
                select: ['task_question', 'universal_question_id', 'answer'],
              });
          }

          // -------------------------
          // Build answerMap for this CP only
          // -------------------------
          for (const ans of cpAnswers) {
            const qId = ans.universal_question_id;
            const values = Array.isArray(ans.answer)
              ? ans.answer.map(String)
              : [String(ans.answer ?? '')];
            const replaced = values.map((v) =>
              uuidRegex.test(v) ? (uuidMap[v] ?? v) : v,
            );
            if (!answerMap[qId]) answerMap[qId] = [];
            answerMap[qId].push(...replaced);
          }
        }
        // -------------------------
        // Process CP result with consistent frontend-friendly format
        // Process CP result
        // -------------------------
        if (widgetType === 'card' || widgetType === 'textArea') {
          const cardResult = await this.processCardOrText(
            cp,
            widgetType,
            answerMap,
          );
          // Transform to frontend format
          results.push({
            custom_parameter_id: cp.id,
            widget_id: cp.widget_id,
            widget_type: widgetType,
            macro_function: cp.macro_function,
            calculated_value: cardResult.calculated_value || null,
          });
        } else if (widgetType === 'table') {
          // Tables will be processed later in the combinedParamsMap approach
          // Skip processing here to avoid conflicts
        } else if (widgetType === 'chart') {
          // only process once per combined_parameter
          if (!processedCombinedParams.has(cp.combined_parameter.id)) {
            processedCombinedParams.add(cp.combined_parameter.id);
            const chartResult = await this.processChart(
              cp,
              'chart',
              datacube_id,
              frequency_id,
              site_id,
            );
            // Transform to frontend format
            results.push({
              combined_parameter_id: cp.combined_parameter.id,
              widget_id: cp.widget_id,
              widget_type: 'chart',
              combinedParams: chartResult.combinedParams || [],
            });
          }
        } else {
          results.push({
            custom_parameter_id: cp.id,
            widget_id: cp.widget_id,
            widget_type: widgetType,
            macro_function: cp.macro_function,
            calculated_value: null,
          });
        }
      }
      return { success: true, response: results };
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? error);
    } finally {
      await queryRunner.release();
      // await publicDataSource.destroy();
    }
  }

  async getAnalyticsResponseByWidgetOpt(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
    widget_id?: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // Step 1: Fetch custom parameters with combined info
    const customParams = await this.datasource.manager
      .getRepository(CustomParameter)
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.combined_parameter', 'combined')
      .leftJoinAndSelect('combined.widget_item', 'widgetItem')
      .leftJoinAndSelect('widgetItem.widget_type', 'widgetType')
      .where(widget_id ? 'cp.widget_id = :widget_id' : '1=1', { widget_id })
      .select([
        'cp.id',
        'cp.macro_function',
        'cp.questions',
        'combined.id',
        'widgetItem.id',
        'widgetType.id',
        'widgetType.type',
        'widgetType.is_time_series',
      ])
      .getMany();

    // Step 2: Collect all unique UIDs for non-time-series macro functions
    const allUIDs = Array.from(
      new Set(
        customParams
          .filter(
            (cp) =>
              !cp.combined_parameter.widget_item.widget_type.is_time_series,
          )
          .flatMap((cp) => {
            if (cp.macro_function && cp.macro_function.trim() !== '') {
              return cp.macro_function.match(/UID_\d+/g) || [];
            }
            if (Array.isArray(cp.questions)) {
              return cp.questions;
            }
            return [];
          }),
      ),
    );

    // Step 3a: First, identify which UIDs are group questions by checking QuestionSequences
    const uidMapping = new Map<string, string>(); // Maps group UID to child UIDs
    const allUIDsExpanded = new Set<string>(allUIDs); // Will include both group UIDs and child UIDs

    if (allUIDs.length > 0) {
      // DEBUG: Check datacube_group_questions table directly
      const groupQuestionsDirectCheck = await queryRunner.manager
        .getRepository(DataCubeGroupQuestions)
        .createQueryBuilder('gq')
        .leftJoinAndSelect('gq.group_question_rule', 'gqr')
        .where('gq.universal_question_id IN (:...allUIDs)', { allUIDs })
        .getMany();

      if (groupQuestionsDirectCheck.length > 0) {
        groupQuestionsDirectCheck.map((gq) => ({
          uid: gq.universal_question_id,
          group_question_rule_id: gq.group_question_rule?.id,
        }));

        // REVERSE LOOKUP: Find parent QuestionSequences using the group rules found
        const ruleIds = groupQuestionsDirectCheck
          .map((gq) => gq.group_question_rule?.id)
          .filter((id) => !!id);

        if (ruleIds.length > 0) {
          const uniqueRuleIds = [...new Set(ruleIds)];

          // Find QuestionSequences in THIS datacube that use these group rules
          const parentSequences = await queryRunner.manager
            .getRepository(DataCubeQuestionSequences)
            .find({
              where: {
                datacube: { id: datacube_id },
                group_question_rule: { id: In(uniqueRuleIds) },
              },
              select: ['universal_question_id'],
            });

          if (parentSequences.length > 0) {
            const parentUIDs = parentSequences.map(
              (ps) => ps.universal_question_id,
            );

            // Add parents to expanded list so we can find their TaskQuestions
            parentUIDs.forEach((uid) => allUIDsExpanded.add(uid));

            // Also map parent -> all requested children?
            // Better to re-run the child expansion loop for these new parents to ensure full mapping
            // But for now, let's just ensure we capture the parents so we get the TaskQuestions.
            // The existing child-mapping logic (Step 3a part 2) iterates 'questionSequences'.
            // We should add these found parents to 'questionSequences' list or re-query for them.
          }
        }
      }

      // First, check if these UIDs exist in QuestionSequences at all (without datacube filter)
      const allQuestionSequences = await queryRunner.manager
        .getRepository(DataCubeQuestionSequences)
        .createQueryBuilder('qs')
        .where('qs.universal_question_id IN (:...allUIDs)', { allUIDs })
        .getMany();

      if (allQuestionSequences.length > 0) {
        allQuestionSequences.map((qs) => ({
          uid: qs.universal_question_id,
          datacube: qs.datacube?.id || 'N/A',
          sequence: qs.sequence,
        }));
      }

      // Fetch question sequences to identify group questions (with datacube filter)
      const questionSequences = await queryRunner.manager
        .getRepository(DataCubeQuestionSequences)
        .createQueryBuilder('qs')
        .leftJoinAndSelect('qs.group_question_rule', 'gqr')
        .leftJoinAndSelect('qs.datacube', 'dc')
        .where('qs.datacube = :datacube_id', { datacube_id })
        .andWhere('qs.universal_question_id IN (:...allUIDs)', { allUIDs })
        .getMany();

      // For each group question, fetch child UIDs
      for (const qs of questionSequences) {
        if (qs.group_question_rule) {
          // Fetch child questions from DataCubeGroupQuestions
          const groupQuestions = await queryRunner.manager
            .getRepository(DataCubeGroupQuestions)
            .find({
              where: {
                group_question_rule: {
                  id: qs.group_question_rule.id,
                },
              },
              select: ['universal_question_id'],
              order: { group_sequence: 'ASC' },
            });

          if (groupQuestions.length > 0) {
            const childUids = groupQuestions.map(
              (gq) => gq.universal_question_id,
            );
            // Store mapping
            uidMapping.set(qs.universal_question_id, childUids.join(','));
            // Add child UIDs to the expanded set
            childUids.forEach((uid) => allUIDsExpanded.add(uid));
          }
        }
      }
    }

    // Step 3b: Fetch TaskQuestions using the EXPANDED UID list (includes child UIDs)
    const expandedUIDsArray = Array.from(allUIDsExpanded);

    const tqQuery = queryRunner.manager
      .getRepository(TaskQuestion)
      .createQueryBuilder('tq')
      .select(['tq.id', 'tq.universal_question_id'])
      .innerJoin('tq.task', 'dt')
      .innerJoin('dt.datacube_frequency', 'dcf')
      .innerJoin('dcf.datacube', 'dc')
      .where('dc.id = :datacube_id', { datacube_id });

    if (site_id !== 'all') tqQuery.andWhere('tq.site = :site_id', { site_id });
    if (frequency_id !== 'all')
      tqQuery.andWhere('dcf.id = :frequency_id', { frequency_id });
    if (expandedUIDsArray.length > 0)
      tqQuery.andWhere('tq.universal_question_id IN (:...expandedUIDs)', {
        expandedUIDs: expandedUIDsArray,
      });

    const taskQuestions = await tqQuery.getMany();

    const taskQuestionIds = taskQuestions.map((tq) => tq.id);

    let taskAnswers: TaskQuestionAnswer[] = [];
    if (taskQuestionIds.length > 0) {
      taskAnswers = await queryRunner.manager
        .getRepository(TaskQuestionAnswer)
        .createQueryBuilder('tqa')
        .leftJoin('tqa.task_question', 'tq')
        .select([
          'tqa.answer',
          'tqa.universal_question_id',
          'tq.id', // only fetch task_question id
        ])
        .where('tq.id IN (:...taskQuestionIds)', { taskQuestionIds })
        .getMany();
    }

    // Step 5: Build answerMap with proper unit conversion handling
    const answerMap: Record<string, string[]> = {};

    // Group answers by UID
    taskAnswers.forEach((answer) => {
      const uid = answer.universal_question_id;
      if (!answerMap[uid]) {
        answerMap[uid] = [];
      }
      answerMap[uid].push(String(answer.answer || ''));
    });

    // Step 6: Create uidAnswerMap with unit conversion using existing logic
    const uidAnswerMap = new Map<string, number>();
    const uidFormattedMap = new Map<string, string>(); // Store user-readable formatted values

    // Helper function to find matching unit conversion with practical base units
    const findUnitConversion = (unit: string) => {
      if (!unit) return null;
      const cleanUnit = unit.trim().toLowerCase();

      // Direct match first
      if (unitConversions[unit?.trim()]) {
        return unitConversions[unit?.trim()];
      }

      // Try to find by partial match and convert to practical base units
      for (const [key, value] of Object.entries(unitConversions)) {
        const keyLower = key.toLowerCase();

        // Check for common unit patterns and convert to practical base units
        if (cleanUnit.includes('tons') && keyLower.includes('tonnes')) {
          // Convert tons to kg (more practical for display)
          return { baseUnit: 'kg', factor: 1000 };
        }
        if (cleanUnit.includes('kg') && keyLower.includes('kilogram')) {
          // Keep kg as kg
          return { baseUnit: 'kg', factor: 1 };
        }
        if (cleanUnit.includes('m3') && keyLower.includes('cubic meter')) {
          // Convert m3 to L (more practical for display)
          return { baseUnit: 'L', factor: 1000 };
        }
        if (cleanUnit.includes('l') && keyLower.includes('liter')) {
          // Keep L as L
          return { baseUnit: 'L', factor: 1 };
        }
        if (cleanUnit.includes('miles') && keyLower.includes('mile')) {
          // Convert miles to km (more practical for display)
          return { baseUnit: 'km', factor: 1.609344 };
        }
        if (cleanUnit.includes('km') && keyLower.includes('kilometer')) {
          // Keep km as km
          return { baseUnit: 'km', factor: 1 };
        }
        if (cleanUnit.includes('inr') && keyLower.includes('₹')) {
          // Keep INR as INR
          return { baseUnit: 'INR', factor: 1 };
        }
        if (cleanUnit.includes('rupee') && keyLower.includes('₹')) {
          // Keep rupee as INR
          return { baseUnit: 'INR', factor: 1 };
        }
      }

      return null;
    };

    Object.entries(answerMap).forEach(([uid, values]) => {
      // Check if this UID has mixed units (comma-separated values)
      const isMixed = values.some((val) => val.includes(','));

      if (isMixed) {
        // Use existing unit conversion logic for mixed units
        const parts = values.map((val) => {
          const [numStr, unit] = val.split(',');
          const num = Number(numStr) || 0;

          // Convert to base unit using flexible unit matching
          const conv = findUnitConversion(unit);
          let baseValue = num;
          if (conv) {
            if (typeof conv.factor === 'number') {
              baseValue = num * conv.factor;
            } else if (typeof conv.factor === 'function') {
              baseValue = conv.factor(num);
            }
          }

          return { baseValue, unit: conv?.baseUnit || unit || '' };
        });

        // Sum all converted base values
        const totalValue = parts.reduce((sum, part) => sum + part.baseValue, 0);
        uidAnswerMap.set(uid, totalValue);

        // Get the base unit from the first part for formatting
        const firstBaseUnit = parts.find((p) => p.unit)?.unit || '';

        // Use existing formatReadable function for consistent formatting
        const formattedValue = this.formatReadable(totalValue, firstBaseUnit);
        uidFormattedMap.set(uid, formattedValue);
      } else {
        // Handle non-comma separated values (simple numeric)
        const totalValue = values.reduce((sum, val) => {
          const num = parseFloat(String(val).replace(/,/g, '')) || 0;
          return sum + num;
        }, 0);
        uidAnswerMap.set(uid, totalValue);
        // Use existing formatReadable function for simple numeric values (no unit)
        const formattedValue = this.formatReadable(totalValue, '');
        uidFormattedMap.set(uid, formattedValue);
      }
    });

    // Handle group questions: aggregate child question values
    uidMapping.forEach((childUidsStr, groupUid) => {
      const childUids = childUidsStr.split(',');

      // Sum up values from all child UIDs
      let groupTotal = 0;
      let hasValues = false;

      childUids.forEach((childUid) => {
        const childValue = uidAnswerMap.get(childUid);
        if (childValue !== undefined && childValue !== null) {
          groupTotal += childValue;
          hasValues = true;
        }
      });

      if (hasValues) {
        uidAnswerMap.set(groupUid, groupTotal);
        uidFormattedMap.set(groupUid, this.formatReadable(groupTotal, ''));
      } else {
        uidAnswerMap.set(groupUid, 0);
        uidFormattedMap.set(groupUid, '0');
      }
    });

    // Step 7: Group by combined parameter and annotate UIDs with answers
    const combinedParamsMap = customParams.reduce(
      (map, cp) => {
        const combinedId = cp.combined_parameter.id;
        const widgetType = cp.combined_parameter.widget_item.widget_type.type;
        const isTimeSeries =
          cp.combined_parameter.widget_item.widget_type.is_time_series;

        let uids:
          | { uid: string; is_latest_data: boolean; answer?: string | number }[]
          | null;
        if (isTimeSeries) {
          uids = null;
        } else {
          const sourceUIDs = (
            cp.macro_function && cp.macro_function.trim() !== ''
              ? cp.macro_function.match(/UID_\d+/g) || []
              : Array.isArray(cp.questions)
                ? cp.questions
                : []
          ) as string[];

          // 🔧 FIX: Handle textArea differently - use raw text from answerMap instead of numeric values
          if (
            widgetType === 'textArea' ||
            widgetType === 'textarea' ||
            widgetType === 'text_area'
          ) {
            uids = sourceUIDs.map((uid) => {
              // Get the raw text answers for textArea fields
              const textAnswers = answerMap[uid] || [];
              const answer =
                textAnswers.length > 0
                  ? textAnswers[textAnswers.length - 1]
                  : ''; // Get the latest answer
              return {
                uid,
                is_latest_data: false,
                answer: answer,
              };
            });
          } else {
            // For non-textArea widgets, use the numeric/formatted values
            uids = sourceUIDs.map((uid) => ({
              uid,
              is_latest_data: false,
              answer:
                uidFormattedMap.get(uid) || String(uidAnswerMap.get(uid) || 0),
            }));
          }
        }

        const macroFunctionEntry: {
          customParameterId: string;
          macroFunction: string;
          uids:
            | {
                uid: string;
                is_latest_data: boolean;
                answer?: string | number;
              }[]
            | null;
        } = {
          customParameterId: cp.id,
          macroFunction: cp.macro_function || '',
          uids,
        };

        if (!map.has(combinedId)) {
          map.set(combinedId, {
            combinedId,
            widgetType,
            isTimeSeries,
            macroFunctions: [macroFunctionEntry],
          });
        } else {
          map.get(combinedId)!.macroFunctions.push(macroFunctionEntry);
        }

        return map;
      },
      new Map<
        string,
        {
          combinedId: string;
          widgetType: string;
          isTimeSeries: boolean;
          macroFunctions: {
            customParameterId: string;
            macroFunction: string;
            uids:
              | {
                  uid: string;
                  is_latest_data: boolean;
                  answer?: string | number;
                }[]
              | null;
          }[];
        }
      >(),
    );
    const currentMapForMacro = new Map<string, any>();
    uidAnswerMap.forEach((value, key) => {
      currentMapForMacro.set(key, { consolidated_response: value });
    });

    await queryRunner.release();

    // Transform to frontend-friendly format
    const transformedResults = await Promise.all(
      Array.from(combinedParamsMap.values()).map(async (item) => {
        if (item.widgetType === 'table') {
          // For tables, process each macro function separately
          const tableResults = [];
          for (const mf of item.macroFunctions) {
            // Find the corresponding CustomParameter to call processTable
            const cp = customParams.find(
              (cp) => cp.id === mf.customParameterId,
            );
            if (cp) {
              const tableResult = await this.processTable(
                cp,
                datacube_id,
                frequency_id,
                site_id,
              );
              tableResults.push(tableResult);
            }
          }
          return tableResults;
        }
        if (item.widgetType === 'chart') {
          // For charts, check for mixed units and convert to common unit
          const chartParams = item.macroFunctions.map((mf) => {
            let calculatedValue: string | number =
              mf.uids
                ?.map((u) => u.answer)
                .filter((a) => a !== null)
                .join(',') || null;
            if (mf.macroFunction && mf.macroFunction.trim() !== '') {
              try {
                const result = this.evaluateMacroExpression(
                  mf.macroFunction,
                  mf.macroFunction.match(/UID_\d+/g) || [],
                  currentMapForMacro,
                  null,
                  null,
                );
                calculatedValue = result;
              } catch (e) {
                console.error('Error evaluating macro function in chart:', e);
              }
            }
            return {
              custom_parameter_id: mf.customParameterId,
              widget_id,
              widget_type: 'chart',
              macro_function: mf.macroFunction,
              calculated_value: calculatedValue,
            };
          });

          // Check if chart has mixed units
          const units = chartParams
            .map((param) => {
              const value = param.calculated_value;
              if (typeof value === 'string' && value.includes(' ')) {
                return value.split(' ').slice(1).join(' '); // Extract unit part
              }
              return null;
            })
            .filter((unit) => unit !== null);

          const uniqueUnits = [...new Set(units)];

          if (uniqueUnits.length > 1) {
            // Mixed units detected - convert to common unit
            const convertedParams = this.convertToCommonUnit(
              chartParams,
              uniqueUnits,
            );
            return {
              combined_parameter_id: item.combinedId,
              widget_id,
              widget_type: 'chart',
              combinedParams: convertedParams,
            };
          }
          // Single unit type - return as is
          return {
            combined_parameter_id: item.combinedId,
            widget_id,
            widget_type: 'chart',
            combinedParams: chartParams,
          };
        }
        // For cards/textArea, return individual items
        return item.macroFunctions.map((mf) => {
          let calculatedValue: string | number =
            mf.uids
              ?.map((u) => u.answer)
              .filter((a) => a !== null)
              .join(',') || null;
          if (
            item.widgetType === 'card' &&
            mf.macroFunction &&
            mf.macroFunction.trim() !== ''
          ) {
            try {
              const result = this.evaluateMacroExpression(
                mf.macroFunction,
                mf.macroFunction.match(/UID_\d+/g) || [],
                currentMapForMacro,
                null,
                null,
              );
              calculatedValue = result;
            } catch (e) {
              console.error('Error evaluating macro function in card:', e);
            }
          }
          return {
            custom_parameter_id: mf.customParameterId,
            widget_id,
            widget_type: item.widgetType,
            macro_function: mf.macroFunction,
            calculated_value: calculatedValue,
          };
        });
      }),
    ); // Close Promise.all

    // Flatten the array to get individual items
    const flattenedResults = transformedResults.flat();

    return { success: true, response: flattenedResults };
  }

  async getCustomDashboardResponseById(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
    dashboard_id?: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    const dashboardId = await queryRunner.manager
      .getRepository(CustomDashboard)
      .findOne({
        where: { id: dashboard_id },
        relations: [
          'blocks',
          'blocks.columns',
          'blocks.columns.types',
          'blocks.columns.types.customType',
        ],
      });

    if (!dashboardId) {
      throw new BadRequestException('Dashboard not found');
    }

    // --------------------------------------------------
    // STEP 0: Fetch widgetParams / dashboardParams / customTypeParams
    // --------------------------------------------------
    for (const block of dashboardId.blocks ?? []) {
      for (const column of block.columns ?? []) {
        for (const type of column.types ?? []) {
          // Fetch widget type parameters
          if (type.widget_type_id) {
            type.widgetParams = await this.datasource.manager
              .getRepository(WidgetType)
              .createQueryBuilder('wt')
              .leftJoinAndSelect('wt.widget_item', 'widgetItem')
              .leftJoinAndSelect('widgetItem.combined_parameters', 'combined')
              .leftJoinAndSelect('combined.custom_parameter', 'cp')
              .where('wt.id = :id', { id: type.widget_type_id })
              .select([
                'cp.id',
                'cp.macro_function',
                'cp.questions',
                'combined.id',
                'widgetItem.id',
                'wt.id',
                'wt.type',
                'wt.is_time_series',
              ])
              .getMany();
          }

          // Fetch dashboard params
          if (type.dashboard_type_id) {
            type.dashboardParams = await this.datasource.manager
              .getRepository(DashboardCustomParameter)
              .createQueryBuilder('dcp')
              .leftJoinAndSelect('dcp.dashboard_combined_parameter', 'combined')
              .leftJoinAndSelect('combined.dashboard_item', 'dashboardItem')
              .leftJoinAndSelect(
                'dashboardItem.dashboard_type',
                'dashboardType',
              )
              .where('dashboardType.id = :id', { id: type.dashboard_type_id })
              .select([
                'dcp.id',
                'dcp.macro_function',
                'dcp.questions',
                'combined.id',
                'dashboardItem.id',
                'dashboardType.id',
                'dashboardType.type',
                'dashboardType.is_time_series',
              ])
              .getMany();
          }

          // Use already joined customType (fetch via tenant connection)
          if (type.customType?.id) {
            type.customTypeParams = await queryRunner.manager
              .getRepository(CustomType)
              .findOne({
                where: { id: type.customType.id },
                relations: [
                  'customItems',
                  'customItems.combinedParameters',
                  'customItems.combinedParameters.customParameters',
                ],
              });
          }
        }
      }
    }

    // --------------------------------------------------
    // STEP A: Build customParams list from widgetParams, dashboardParams, customType
    // --------------------------------------------------
    const customParams: any[] = [];

    for (const block of dashboardId.blocks ?? []) {
      for (const column of block.columns ?? []) {
        for (const type of column.types ?? []) {
          // Handle widgetParams (from query) or widget_type_obj (from JSON)
          const widgetSource = type.widgetParams?.length
            ? type.widgetParams
            : type.widget_type_obj
              ? [
                  {
                    ...(type.widget_type_obj || {}),
                    widget_item: type.widget_type_obj?.widget_item,
                  },
                ]
              : [];

          if (widgetSource.length) {
            for (const wp of widgetSource) {
              const normalizedType = this.normalizeWidgetType(wp.type);

              // Handle both widget_item (single) and widget_item (array)
              const widgetItems = Array.isArray(wp.widget_item)
                ? wp.widget_item
                : wp.widget_item
                  ? [wp.widget_item]
                  : [];

              for (const widgetItem of widgetItems) {
                for (const combined of widgetItem?.combined_parameters ?? []) {
                  const customParameterList = Array.isArray(
                    combined.custom_parameter,
                  )
                    ? combined.custom_parameter
                    : combined.custom_parameter
                      ? [combined.custom_parameter]
                      : [];
                  for (const cp of customParameterList) {
                    const widgetId =
                      cp.widget_id ??
                      combined.widget_item?.id ??
                      widgetItem.id ??
                      wp.id ??
                      dashboard_id;
                    customParams.push({
                      id: cp.id,
                      macro_function: cp.macro_function,
                      questions: cp.questions,
                      widget_id: widgetId,
                      block_id: block.id,
                      column_id: column.id,
                      type_id: type.id,
                      block_sequence: block.sequence ?? 0,
                      column_sequence: column.sequence ?? 0,
                      type_sequence: (type as any)?.sequence ?? 0,
                      combined_parameter: {
                        ...combined,
                        widget_item: {
                          ...(combined.widget_item ?? { id: widgetItem.id }),
                          widget_type: {
                            type: wp.type,
                            is_time_series: wp.is_time_series,
                          },
                        },
                      },
                      widget_type: normalizedType,
                      is_time_series: wp.is_time_series ?? false,
                      source: 'widget',
                    });
                  }
                }
              }
            }
          }

          if (type.dashboardParams?.length) {
            for (const dp of type.dashboardParams) {
              const combined = dp.dashboard_combined_parameter;
              if (!combined?.dashboard_item) continue;

              const dashType = combined.dashboard_item.dashboard_type;
              const normalizedType = this.normalizeWidgetType(dashType?.type);
              const widgetId =
                dp.dashboard_id ??
                combined.dashboard_item.id ??
                dashboard_id ??
                dp.id;

              customParams.push({
                id: dp.id,
                macro_function: dp.macro_function,
                questions: dp.questions,
                widget_id: widgetId,
                block_id: block.id,
                column_id: column.id,
                type_id: type.id,
                block_sequence: block.sequence ?? 0,
                column_sequence: column.sequence ?? 0,
                type_sequence: (type as any)?.sequence ?? 0,
                combined_parameter: {
                  id: combined.id,
                  widget_item: {
                    id: widgetId,
                    widget_type: {
                      type: dashType?.type,
                      is_time_series: dashType?.is_time_series ?? false,
                    },
                  },
                },
                widget_type: normalizedType,
                is_time_series: dashType?.is_time_series ?? false,
                source: 'dashboard',
              });
            }
          }

          if (type.customTypeParams?.customItems?.length) {
            const customType = type.customTypeParams;
            const normalizedType = this.normalizeWidgetType(customType.type);
            for (const item of customType.customItems ?? []) {
              for (const combined of item.combinedParameters ?? []) {
                for (const cp of combined.customParameters ?? []) {
                  const widgetId =
                    cp.custom_item_id ?? customType.id ?? dashboard_id ?? cp.id;
                  customParams.push({
                    id: cp.id,
                    macro_function: cp.macro_function,
                    questions: cp.questions,
                    widget_id: widgetId,
                    block_id: block.id,
                    column_id: column.id,
                    type_id: type.id,
                    block_sequence: block.sequence ?? 0,
                    column_sequence: column.sequence ?? 0,
                    type_sequence: (type as any)?.sequence ?? 0,
                    combined_parameter: {
                      id: combined.id,
                      widget_item: {
                        id: widgetId,
                        widget_type: {
                          type: customType.type,
                          is_time_series: customType.is_time_series ?? false,
                        },
                      },
                    },
                    widget_type: normalizedType,
                    is_time_series: customType.is_time_series ?? false,
                    source: 'custom',
                  });
                }
              }
            }
          } else if (type.customTypeParams) {
            const customType = type.customTypeParams;
            const widgetId = customType.id ?? dashboard_id ?? customType.type;
            customParams.push({
              id: customType.id,
              macro_function: customType.macro_function,
              questions: customType.questions,
              widget_id: widgetId,
              block_id: block.id,
              column_id: column.id,
              type_id: type.id,
              block_sequence: block.sequence ?? 0,
              column_sequence: column.sequence ?? 0,
              type_sequence: (type as any)?.sequence ?? 0,
              combined_parameter: {
                id: customType.id,
                widget_item: {
                  id: widgetId,
                  widget_type: {
                    type: customType.type,
                    is_time_series: customType.is_time_series ?? false,
                  },
                },
              },
              widget_type: this.normalizeWidgetType(customType.type),
              is_time_series: customType.is_time_series ?? false,
              source: 'custom',
            });
          }
        }
      }
    }

    // --------------------------------------------------
    // STEP B: Extract all UIDs
    // --------------------------------------------------
    const allUIDs = Array.from(
      new Set(
        customParams
          .filter(
            (cp) =>
              !cp.combined_parameter.widget_item.widget_type.is_time_series,
          )
          .flatMap((cp) => {
            if (cp.macro_function)
              return cp.macro_function.match(/UID_\d+/g) || [];
            if (Array.isArray(cp.questions)) return cp.questions;
            return [];
          }),
      ),
    );

    // --------------------------------------------------
    // STEP C: Fetch TaskQuestions → TaskAnswers
    // --------------------------------------------------
    const tqQuery = await queryRunner.manager
      .getRepository(TaskQuestion)
      .createQueryBuilder('tq')
      .select(['tq.id', 'tq.universal_question_id'])
      .innerJoin('tq.task', 'dt')
      .innerJoin('dt.datacube_frequency', 'dcf')
      .innerJoin('dcf.datacube', 'dc')
      .where('dc.id = :datacube_id', { datacube_id });

    if (site_id !== 'all') tqQuery.andWhere('tq.site = :site_id', { site_id });
    if (frequency_id !== 'all')
      tqQuery.andWhere('dcf.id = :frequency_id', { frequency_id });
    if (allUIDs.length)
      tqQuery.andWhere('tq.universal_question_id IN (:...uids)', {
        uids: allUIDs,
      });

    const taskQuestions = await tqQuery.getMany();
    const taskQuestionIds = taskQuestions.map((tq) => tq.id);

    let taskAnswers: TaskQuestionAnswer[] = [];
    if (taskQuestionIds.length) {
      taskAnswers = await queryRunner.manager
        .getRepository(TaskQuestionAnswer)
        .createQueryBuilder('tqa')
        .leftJoin('tqa.task_question', 'tq')
        .select(['tqa.answer', 'tqa.universal_question_id', 'tq.id'])
        .where('tq.id IN (:...ids)', { ids: taskQuestionIds })
        .getMany();
    }

    // --------------------------------------------------
    // STEP D: Format UIDs and answers (shared logic with getAnalyticsResponseByWidgetOpt)
    // --------------------------------------------------
    const answerMap: Record<string, string[]> = {};
    taskAnswers.forEach((ans) => {
      if (!answerMap[ans.universal_question_id]) {
        answerMap[ans.universal_question_id] = [];
      }
      answerMap[ans.universal_question_id].push(String(ans.answer ?? ''));
    });

    const uidAnswerMap = new Map<string, number>();
    const uidFormattedMap = new Map<string, string>();

    const findUnitConversion = (unit: string) => {
      if (!unit) return null;
      const cleanUnit = unit.trim().toLowerCase();
      if (unitConversions[unit.trim()]) return unitConversions[unit.trim()];
      if (cleanUnit.includes('tons')) return { baseUnit: 'kg', factor: 1000 };
      if (cleanUnit.includes('kg')) return { baseUnit: 'kg', factor: 1 };
      if (cleanUnit.includes('m3')) return { baseUnit: 'L', factor: 1000 };
      if (cleanUnit.includes('l')) return { baseUnit: 'L', factor: 1 };
      if (cleanUnit.includes('miles'))
        return { baseUnit: 'km', factor: 1.609344 };
      if (cleanUnit.includes('km')) return { baseUnit: 'km', factor: 1 };
      if (cleanUnit.includes('inr') || cleanUnit.includes('rupee'))
        return { baseUnit: 'INR', factor: 1 };
      return null;
    };

    Object.entries(answerMap).forEach(([uid, values]) => {
      const isMixed = values.some((val) => val.includes(','));
      if (isMixed) {
        const parts = values.map((val) => {
          const [numStr, unit] = val.split(',');
          const num = Number(numStr) || 0;
          const conv = findUnitConversion(unit);
          const baseValue = conv
            ? typeof conv.factor === 'number'
              ? num * conv.factor
              : conv.factor(num)
            : num;
          return { baseValue, unit: conv?.baseUnit || unit || '' };
        });

        const totalValue = parts.reduce((sum, part) => sum + part.baseValue, 0);
        uidAnswerMap.set(uid, totalValue);
        uidFormattedMap.set(
          uid,
          this.formatReadable(
            totalValue,
            parts.find((p) => p.unit)?.unit || '',
          ),
        );
      } else {
        const totalValue = values.reduce((sum, val) => {
          const num = parseFloat(String(val).replace(/,/g, '')) || 0;
          return sum + num;
        }, 0);
        uidAnswerMap.set(uid, totalValue);
        uidFormattedMap.set(uid, this.formatReadable(totalValue, ''));
      }
    });

    const currentMapForMacro = new Map<string, any>();
    uidAnswerMap.forEach((value, key) => {
      currentMapForMacro.set(key, { consolidated_response: value });
    });

    // --------------------------------------------------
    // STEP E: Group by combined parameter and shape response
    // --------------------------------------------------
    const combinedParamsMap = customParams.reduce<
      Map<string, CombinedParamGroup>
    >((map, cp) => {
      if (!cp.combined_parameter) return map;
      const combinedId = cp.combined_parameter.id ?? cp.id;
      const widgetType =
        cp.widget_type ??
        this.normalizeWidgetType(
          cp.combined_parameter.widget_item?.widget_type?.type,
        );
      const isTimeSeries =
        cp.is_time_series ??
        cp.combined_parameter.widget_item?.widget_type?.is_time_series ??
        false;

      const sourceUIDs =
        cp.macro_function?.match(/UID_\d+/g) ||
        (Array.isArray(cp.questions) ? cp.questions : []);

      const uids = isTimeSeries
        ? null
        : sourceUIDs.map((uid) => ({
            uid,
            is_latest_data: false,
            answer:
              uidFormattedMap.get(uid) || String(uidAnswerMap.get(uid) || 0),
          }));

      const macroFunctionEntry = {
        customParameterId: cp.id,
        macroFunction: cp.macro_function || '',
        widgetId:
          cp.widget_id ??
          cp.combined_parameter.widget_item?.id ??
          dashboard_id ??
          cp.id,
        source: cp.source ?? 'widget',
        blockId: cp.block_id,
        columnId: cp.column_id,
        typeId: cp.type_id,
        blockSequence: cp.block_sequence ?? 0,
        columnSequence: cp.column_sequence ?? 0,
        typeSequence: cp.type_sequence ?? 0,
        uids,
      };

      if (!map.has(combinedId)) {
        map.set(combinedId, {
          combinedId,
          widgetType,
          isTimeSeries,
          macroFunctions: [macroFunctionEntry],
        });
      } else {
        map.get(combinedId).macroFunctions.push(macroFunctionEntry);
      }
      return map;
    }, new Map<string, CombinedParamGroup>());

    await queryRunner.release();

    const cpResultMap = new Map<string, any>();
    const combinedResultMap = new Map<string, any>();
    const combinedParamGroups = Array.from(combinedParamsMap.values());
    const transformedResults = await Promise.all(
      combinedParamGroups.map(async (item) => {
        if (item.widgetType === 'table') {
          const tableResults = [];
          for (const mf of item.macroFunctions) {
            const cp = customParams.find(
              (param) => param.id === mf.customParameterId,
            );
            if (!cp) continue;
            cp.widget_id =
              cp.widget_id ??
              cp.combined_parameter?.widget_item?.id ??
              mf.widgetId ??
              dashboard_id ??
              cp.id;

            if (cp.source === 'widget') {
              const tableResult = await this.processTable(
                cp,
                datacube_id,
                frequency_id,
                site_id,
              );
              const enrichedResult = {
                ...tableResult,
                block_id: mf.blockId,
                column_id: mf.columnId,
                type_id: mf.typeId,
                block_sequence: mf.blockSequence,
                column_sequence: mf.columnSequence,
                type_sequence: mf.typeSequence,
              };
              tableResults.push(enrichedResult);
              cpResultMap.set(cp.id, enrichedResult);
            } else {
              const fallbackTable = {
                custom_parameter_id: cp.id,
                widget_id: cp.widget_id,
                widget_type: 'table',
                macro_function: cp.macro_function,
                columns: [],
                rows: [],
                block_id: mf.blockId,
                column_id: mf.columnId,
                type_id: mf.typeId,
                block_sequence: mf.blockSequence,
                column_sequence: mf.columnSequence,
                type_sequence: mf.typeSequence,
              };
              tableResults.push(fallbackTable);
              cpResultMap.set(cp.id, fallbackTable);
            }
          }
          return tableResults;
        }

        if (item.widgetType === 'chart') {
          const chartParams = item.macroFunctions.map((mf) => {
            let calculatedValue: string | number =
              mf.uids
                ?.map((u) => u.answer)
                .filter((a) => a !== null)
                .join(',') || null;
            if (mf.macroFunction && mf.macroFunction.trim() !== '') {
              try {
                const result = this.evaluateMacroExpression(
                  mf.macroFunction,
                  mf.macroFunction.match(/UID_\d+/g) || [],
                  currentMapForMacro,
                  null,
                  null,
                );
                calculatedValue = result;
              } catch (e) {
                console.error('Error evaluating macro function in chart:', e);
              }
            }
            return {
              custom_parameter_id: mf.customParameterId,
              widget_id: mf.widgetId,
              widget_type: 'chart',
              macro_function: mf.macroFunction,
              calculated_value: calculatedValue,
            };
          });

          chartParams.forEach((param) => {
            cpResultMap.set(param.custom_parameter_id, {
              ...param,
              combined_parameter_id: item.combinedId,
            });
          });

          const units = chartParams
            .map((param) => {
              const value = param.calculated_value;
              if (typeof value === 'string' && value.includes(' ')) {
                return value.split(' ').slice(1).join(' ');
              }
              return null;
            })
            .filter((unit): unit is string => unit !== null);

          const uniqueUnits = [...new Set(units)];

          const chartResponse = {
            // combined_parameter_id: item.combinedId,
            widget_id: chartParams[0]?.widget_id,
            widget_type: 'chart',
            // block_id: item.macroFunctions[0]?.blockId ?? null,
            // column_id: item.macroFunctions[0]?.columnId ?? null,
            // type_id: item.macroFunctions[0]?.typeId ?? null,
            // block_sequence: item.macroFunctions[0]?.blockSequence ?? null,
            // column_sequence: item.macroFunctions[0]?.columnSequence ?? null,
            // type_sequence: item.macroFunctions[0]?.typeSequence ?? null,
            combinedParams:
              uniqueUnits.length > 1
                ? this.convertToCommonUnit(chartParams, uniqueUnits)
                : chartParams,
          };
          combinedResultMap.set(item.combinedId, chartResponse);
          return chartResponse;
        }

        return item.macroFunctions.map((mf) => {
          let calculatedValue: string | number =
            mf.uids
              ?.map((u) => u.answer)
              .filter((a) => a !== null)
              .join(',') || null;
          if (
            item.widgetType === 'card' &&
            mf.macroFunction &&
            mf.macroFunction.trim() !== ''
          ) {
            try {
              const result = this.evaluateMacroExpression(
                mf.macroFunction,
                mf.macroFunction.match(/UID_\d+/g) || [],
                currentMapForMacro,
                null,
                null,
              );
              calculatedValue = result;
            } catch (e) {
              console.error(
                'Error evaluating macro function in dashboard card:',
                e,
              );
            }
          }
          const entry = {
            custom_parameter_id: mf.customParameterId,
            widget_id: mf.widgetId,
            widget_type: item.widgetType,
            macro_function: mf.macroFunction,
            calculated_value: calculatedValue,
            block_id: mf.blockId,
            column_id: mf.columnId,
            type_id: mf.typeId,
            block_sequence: mf.blockSequence,
            column_sequence: mf.columnSequence,
            type_sequence: mf.typeSequence,
            combined_parameter_id: item.combinedId,
          };
          cpResultMap.set(mf.customParameterId, entry);
          return entry;
        });
      }),
    );

    // Build a flat response array similar to the analytics endpoints
    //  - include individual custom parameter results (cards, text, tables)
    //  - replace grouped chart custom-params with a single combined-parameter chart object
    const combinedChartIds = Array.from(combinedResultMap.keys());

    // Get all cp results as array
    const cpEntries = Array.from(cpResultMap.values())
      // If an entry belongs to a combined chart, skip it (we'll include the combined chart instead)
      .filter((entry: any) => {
        const combinedId =
          entry.combined_parameter_id ?? entry.combined_parameter_id;
        return !(combinedId && combinedChartIds.includes(combinedId));
      })
      // Normalize some common field names so the frontend gets consistent objects
      .map((entry: any) => {
        // Table responses already contain columns/rows; leave as-is
        if (entry.widget_type === 'table' || entry.widget_type === 'Table')
          return entry;

        // Ensure common keys are present and names match expected output
        return {
          custom_parameter_id:
            entry.custom_parameter_id ??
            entry.custom_parameter_id ??
            entry.custom_parameter_id,
          widget_id: entry.widget_id ?? entry.widget_id ?? null,
          widget_type: entry.widget_type ?? entry.widget_type ?? 'unknown',
          macro_function: entry.macro_function ?? entry.macro_function ?? '',
          calculated_value:
            entry.calculated_value ??
            entry.calculated_value ??
            entry.calculatedValue ??
            null,
          // preserve sequence metadata for optional sorting later
          // block_sequence: entry.block_sequence ?? entry.blockSequence ?? 0,
          // column_sequence: entry.column_sequence ?? entry.columnSequence ?? 0,
          // type_sequence: entry.type_sequence ?? entry.typeSequence ?? 0,
        };
      });

    const chartEntries = Array.from(combinedResultMap.values()).map(
      (c: any) => ({
        combined_parameter_id:
          c.combined_parameter_id ?? c.combined_parameter_id ?? c.combinedId,
        widget_id: c.widget_id ?? null,
        widget_type: 'chart',
        combinedParams: c.combinedParams ?? c.combinedParams ?? [],
        // block_sequence: c.block_sequence ?? c.blockSequence ?? 0,
        // column_sequence: c.column_sequence ?? c.columnSequence ?? 0,
        // type_sequence: c.type_sequence ?? c.typeSequence ?? 0,
      }),
    );

    // const chartEntries = Array.from(combinedResultMap.values())
    //   .flatMap((c: any) =>
    //     (c.combinedParams ?? []).map((param: any) => ({
    //       ...param,   // individual param, not array
    //       // widget_type: 'chart',
    //       // widget_id: c.widget_id ?? null,
    //       // combined_parameter_id: param.id,
    //       // block_sequence: c.block_sequence ?? c.blockSequence ?? 0,
    //       // column_sequence: c.column_sequence ?? c.columnSequence ?? 0,
    //       // type_sequence: c.type_sequence ?? c.typeSequence ?? 0,
    //     }))
    //   );

    // Combine and sort by block/column/type sequence so order resembles layout
    const flattenedResults = [...cpEntries, ...chartEntries].sort(
      (a: any, b: any) => {
        const ax = a.block_sequence ?? 0;
        const bx = b.block_sequence ?? 0;
        if (ax !== bx) return ax - bx;
        const ay = a.column_sequence ?? 0;
        const by = b.column_sequence ?? 0;
        if (ay !== by) return ay - by;
        const at = a.type_sequence ?? 0;
        const bt = b.type_sequence ?? 0;
        return at - bt;
      },
    );

    return {
      success: true,
      response: flattenedResults,
    };
  }

  // Helper method to convert mixed units to common unit for charts
  private convertToCommonUnit(
    chartParams: any[],
    uniqueUnits: string[],
  ): any[] {
    // Determine the best common unit based on the units present
    const commonUnit = this.determineCommonUnit(uniqueUnits);

    return chartParams.map((param) => {
      const value = param.calculated_value;
      if (typeof value === 'string' && value.includes(' ')) {
        const [numStr, unit] = value.split(' ');
        const num = parseFloat(numStr);

        if (!isNaN(num)) {
          const convertedValue = this.convertToTargetUnit(
            num,
            unit,
            commonUnit,
          );
          return {
            ...param,
            calculated_value: this.formatReadable(convertedValue, commonUnit),
          };
        }
      }
      return param;
    });
  }

  // Helper method to determine the best common unit
  private determineCommonUnit(units: string[]): string {
    // Priority order for common units (most practical for charts)
    const unitPriority = {
      kg: 1, // Mass - most common
      L: 2, // Volume - common
      'km/h': 3, // Speed - common
      INR: 4, // Currency - common
      km: 5, // Distance - common
      m: 6, // Distance - smaller
      g: 7, // Mass - smaller
      ml: 8, // Volume - smaller
    };

    // Find the unit with highest priority (lowest number)
    let bestUnit = units[0];
    let bestPriority = unitPriority[bestUnit] || 999;

    for (const unit of units) {
      const priority = unitPriority[unit] || 999;
      if (priority < bestPriority) {
        bestUnit = unit;
        bestPriority = priority;
      }
    }

    return bestUnit;
  }

  // Helper method to convert between units
  private convertToTargetUnit(
    value: number,
    fromUnit: string,
    toUnit: string,
  ): number {
    // If same unit, return as is
    if (fromUnit === toUnit) return value;

    // Conversion factors to the target unit
    const conversions = {
      // Mass conversions (to kg)
      kg: { g: 0.001, tons: 1000, tonnes: 1000 },
      g: { kg: 1000, tons: 1000000, tonnes: 1000000 },
      tons: { kg: 0.001, g: 0.000001, tonnes: 1 },
      tonnes: { kg: 0.001, g: 0.000001, tons: 1 },

      // Volume conversions (to L)
      L: { ml: 0.001, m3: 1000, 'm³': 1000 },
      ml: { L: 1000, m3: 1000000, 'm³': 1000000 },
      m3: { L: 0.001, ml: 0.000001, 'm³': 1 },
      'm³': { L: 0.001, ml: 0.000001, m3: 1 },

      // Speed conversions (to km/h)
      'km/h': { mph: 1.60934, 'm/s': 3.6 },
      mph: { 'km/h': 0.621371, 'm/s': 2.23694 },
      'm/s': { 'km/h': 0.277778, mph: 0.44704 },

      // Distance conversions (to km)
      km: { m: 0.001, miles: 1.60934 },
      m: { km: 1000, miles: 1609.34 },
      miles: { km: 0.621371, m: 0.000621371 },

      // Currency (no conversion needed)
      INR: { '₹': 1, rupee: 1 },
      '₹': { INR: 1, rupee: 1 },
      rupee: { INR: 1, '₹': 1 },
    };

    const conversionFactor = conversions[toUnit]?.[fromUnit];
    if (conversionFactor !== undefined) {
      return value * conversionFactor;
    }

    // If no conversion found, return original value
    return value;
  }

  // ---------------- Helpers for dashboard Analytics----------------

  private normalizeWidgetType(typeEntity?: string): string {
    if (!typeEntity) return 'unknown';
    const lowerType = typeEntity.toLowerCase();
    if (lowerType.includes('chart')) return 'chart';
    switch (lowerType) {
      case 'card':
        return 'card';
      case 'textarea':
      case 'text_area':
        return 'textArea';
      case 'table':
        return 'table';
      default:
        return 'unknown';
    }
  }

  private resolveDashboardWidgetType(type: any): string {
    if (!type) return 'unknown';
    if (type.customTypeParams?.type) {
      return this.normalizeWidgetType(type.customTypeParams.type);
    }
    if (type.customType?.type) {
      return this.normalizeWidgetType(type.customType.type);
    }
    if (Array.isArray(type.widgetParams) && type.widgetParams.length) {
      return this.normalizeWidgetType(type.widgetParams[0]?.type);
    }
    if (type.widget_type_obj?.type) {
      return this.normalizeWidgetType(type.widget_type_obj.type);
    }
    if (Array.isArray(type.dashboardParams) && type.dashboardParams.length) {
      const dashType =
        type.dashboardParams[0]?.dashboard_combined_parameter?.dashboard_item
          ?.dashboard_type || type.dashboardParams[0]?.dashboard_type;
      if (dashType?.type) {
        return this.normalizeWidgetType(dashType.type);
      }
    }
    return 'unknown';
  }

  private buildCustomDashboardTypeResponse(
    type: any,
    cpResultMap: Map<string, any>,
    combinedResultMap: Map<string, any>,
  ) {
    const widgetEntries =
      type.widgetParams?.map((wp) => ({
        source: 'widget',
        widget_type_id: wp.id,
        widget_type: this.normalizeWidgetType(wp.type),
        widget_item_id: wp.widget_item?.id ?? null,
        combined_parameters: this.buildCombinedParameterResponse(
          wp.widget_item?.combined_parameters ?? [],
          cpResultMap,
          combinedResultMap,
        ),
      })) ?? [];

    const dashboardEntries =
      type.dashboardParams?.map((dp) => {
        const combinedList = this.toArray(
          dp.dashboard_combined_parameter ??
            dp.dashboard_combined_parameters ??
            [],
        );
        const dashboardItem = combinedList[0]?.dashboard_item;
        return {
          source: 'dashboard',
          dashboard_custom_parameter_id: dp.id,
          dashboard_item_id: dashboardItem?.id ?? null,
          dashboard_type: dashboardItem?.dashboard_type?.type ?? null,
          combined_parameters: this.buildCombinedParameterResponse(
            combinedList,
            cpResultMap,
            combinedResultMap,
          ),
        };
      }) ?? [];

    let customEntry = null;
    if (type.customTypeParams) {
      const customType = type.customTypeParams;
      if (customType.customItems?.length) {
        customEntry = {
          source: 'custom',
          custom_type_id: customType.id,
          type: customType.type,
          custom_items: customType.customItems.map((item) => ({
            custom_item_id: item.id,
            title: item.title,
            combined_parameters: this.buildCombinedParameterResponse(
              item.combinedParameters ?? [],
              cpResultMap,
              combinedResultMap,
            ),
          })),
        };
      } else {
        customEntry = {
          source: 'custom',
          custom_type_id: customType.id,
          type: customType.type,
          combined_parameters: [
            {
              combined_parameter_id: customType.id,
              custom_parameters: [
                {
                  custom_parameter_id: customType.id,
                  macro_function: customType.macro_function,
                  questions: customType.questions,
                  calculated: cpResultMap.get(customType.id) ?? null,
                },
              ],
              result: combinedResultMap.get(customType.id) ?? null,
            },
          ],
        };
      }
    }

    return {
      type_id: type.id,
      type_sequence: (type as any)?.sequence ?? 0,
      widget_type_id: type.widget_type_id ?? null,
      dashboard_type_id: type.dashboard_type_id ?? null,
      custom_type_id: type.customType?.id ?? type.customTypeParams?.id ?? null,
      widget_type: this.resolveDashboardWidgetType(type),
      widgets: widgetEntries,
      dashboards: dashboardEntries,
      custom: customEntry,
    };
  }

  private buildCombinedParameterResponse(
    combinedList: any[],
    cpResultMap: Map<string, any>,
    combinedResultMap: Map<string, any>,
  ) {
    return combinedList.map((combined) => {
      const customParameters = this.toArray(
        combined.custom_parameter ?? combined.customParameters ?? [],
      ).map((cp) => ({
        custom_parameter_id: cp.id,
        macro_function: cp.macro_function,
        questions: cp.questions,
        calculated: cpResultMap.get(cp.id) ?? null,
      }));

      return {
        combined_parameter_id: combined.id,
        sequence: combined.sequence ?? null,
        result: combinedResultMap.get(combined.id) ?? null,
        custom_parameters: customParameters,
      };
    });
  }

  private toArray<T>(value: T | T[] | undefined | null): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  private formatWithUnit(value: number, unitType: 'rupees' | 'kg'): string {
    if (unitType === 'rupees') {
      if (value < 1000) {
        return `${value.toLocaleString('en-IN')} Rupees`;
      }
      if (value < 10000000) {
        // less than 1 Crore
        const lakhs = (value / 100000).toFixed(2);
        return `${lakhs} Lakhs`;
      }
      const crores = (value / 10000000).toFixed(2);
      return `${crores} Crores`;
    }
    if (unitType === 'kg') {
      if (value < 1000) {
        return `${value.toLocaleString('en-IN')} Kg`;
      }
      if (value < 1000000) {
        // less than 1000 Tonnes
        const tonnes = (value / 1000).toFixed(2);
        return `${tonnes} Tonnes`;
      }
      const kiloTonnes = (value / 1000000).toFixed(2);
      return `${kiloTonnes} Kilo-Tonnes`;
    }
    // fallback if unknown
    return value.toString();
  }

  private formatReadable(value: number, unit: string): string {
    if (!unit) return String(value);

    const lowerUnit = unit.toLowerCase();

    // Helper function to format numbers without unnecessary .00
    const formatNumber = (num: number, decimals = 2): string => {
      const formatted = num.toFixed(decimals);
      return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
    };

    if (value === 0) {
      switch (lowerUnit) {
        case 'rupees':
        case '₹':
          return '0 ₹';
        case 'tonnes':
          return '0 t';
        case 'km':
          return '0 km';
        case 'kl':
          return '0 KL';
        case 't co₂e':
          return '0 t CO₂e';
        default:
          return `0 ${unit}`;
      }
    }

    // ------------------ Currency ------------------
    if (lowerUnit === 'rupees' || lowerUnit.includes('₹')) {
      if (value < 1_00_000) return `${formatNumber(value / 1_000)} Thousand ₹`;
      if (value < 1_00_00_000)
        return `${formatNumber(value / 1_00_000)} Lakh ₹`;
      return `${formatNumber(value / 1_00_00_000)} Crore ₹`;
    }

    // ------------------ Mass ------------------
    if (lowerUnit === 'tonnes') {
      if (value < 1_000) return `${formatNumber(value)} t`;
      return `${formatNumber(value / 1_000)} Kt`;
    }

    // ------------------ Length ------------------
    if (lowerUnit === 'km') {
      if (value < 1_000) return `${formatNumber(value)} km`;
      return `${formatNumber(value / 1_000)} Thousand km`;
    }

    // ------------------ Volume ------------------
    if (lowerUnit === 'kl') {
      if (value < 1_000) return `${formatNumber(value)} KL`;
      return `${formatNumber(value / 1_000)} ML`;
    }

    // ------------------ Emissions ------------------
    if (lowerUnit === 't co₂e') {
      if (value < 1_000) return `${formatNumber(value)} t CO₂e`;
      return `${formatNumber(value / 1_000)} kt CO₂e`;
    }

    // ------------------ Percentage ------------------
    if (lowerUnit === 'percentage' || lowerUnit === '%') {
      return `${value.toFixed(2)} %`;
    }

    // ------------------ Default fallback ------------------
    return `${formatNumber(value)} ${unit}`;
  }

  private async processCardOrText(
    cp: CustomParameter,
    widgetType: string,
    answerMap: Record<string, string[]>,
  ) {
    const qIds = cp.questions || [];
    const macro = cp.macro_function?.trim();

    let calculatedValue: string | number = '';
    if (widgetType === 'textArea') {
      const allAnswers = qIds.flatMap((qId) => answerMap[qId] || []);
      const text = allAnswers.join(' ').trim();

      if (text) {
        const wordCount = text.split(/\s+/).length;
        if (wordCount > 50) {
          // try {
          //   const body = {
          //     webpageContent: 'analyticsrephrase',
          //     text,
          //   };
          //   // const result = await this.chatbotService.handleAiRequest(body);

          //   // calculatedValue = result.text || text;

          // } catch (error) {
          //   calculatedValue = text;
          // }
          calculatedValue = allAnswers[allAnswers.length - 1];
        } else {
          calculatedValue = allAnswers[allAnswers.length - 1];
        }
      }
    } else if (!macro) {
      const allAnswers = qIds.flatMap((qId) => answerMap[qId] || []);
      calculatedValue =
        allAnswers.length === 1 ? allAnswers[0] : allAnswers.join(', ');
    } else {
      const isNumeric = qIds.every((qId) =>
        (answerMap[qId] || []).every((val) => !isNaN(Number(val))),
      );
      const isMixed = qIds.some((qId) =>
        (answerMap[qId] || []).some((val) => val.includes(',')),
      );

      if (isMixed) {
        const parts = qIds.map((qId) => {
          const vals = answerMap[qId] || [];
          return vals.map((val) => {
            const [numStr, unit] = val.split(',');
            const num = Number(numStr) || 0;

            // convert to base unit
            const conv = unitConversions[unit?.trim()];
            let baseValue = num;
            if (conv) {
              if (typeof conv.factor === 'number') {
                baseValue = num * conv.factor;
              } else if (typeof conv.factor === 'function') {
                baseValue = conv.factor(num);
              }
            }

            return { baseValue, unit: conv?.baseUnit || unit || '' };
          });
        });

        // replace each qId in macro with sum of base values
        let expr = macro;
        qIds.forEach((qId, idx) => {
          const numSum = parts[idx].reduce((a, b) => a + b.baseValue, 0);
          expr = expr.replace(new RegExp(qId, 'g'), String(numSum));
        });

        let numericResult = 0;
        try {
          numericResult = eval(expr);
        } catch {
          numericResult = 0;
        }

        // pick the base unit from the first available part
        const firstBaseUnit =
          parts.find((p) => p.length && p[0].unit)?.[0].unit || '';

        // calculatedValue = `${numericResult} ${firstBaseUnit}`;
        calculatedValue = this.formatReadable(numericResult, firstBaseUnit);
        // calculatedValue = `${numericResult.toLocaleString('en-IN')} ${firstBaseUnit}`; // ennable this line if comma needed
      } else if (isNumeric) {
        let expr = macro;
        qIds.forEach((qId) => {
          const sumValue = (answerMap[qId] || []).reduce(
            (a, b) => a + Number(b || 0),
            0,
          );
          expr = expr.replace(new RegExp(qId, 'g'), String(sumValue));
        });

        try {
          const result = eval(expr);
          calculatedValue = Number(result);
        } catch {
          calculatedValue = 0;
        }
      } else {
        calculatedValue = qIds.flatMap((qId) => answerMap[qId] || []).join(' ');
      }
    }
    return {
      custom_parameter_id: cp.id,
      widget_id: cp.widget_id,
      widget_type: widgetType,
      macro_function: cp.macro_function,
      calculated_value: calculatedValue || null,
    };
  }

  async processTable(
    cp: CustomParameter,
    datacube_id: string,
    frequency_id?: string,
    site_id?: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      const groupQuestionId = cp.questions?.[0];

      if (!groupQuestionId) {
        console.warn('No groupQuestionId found for this CustomParameter');
        return {
          custom_parameter_id: cp.id,
          widget_id: cp.widget_id,
          widget_type: 'table',
          macro_function: cp.macro_function,
          columns: [],
          rows: [],
        };
      }

      // 1. Find the group rule (by public_group_id)
      const groupRule = await queryRunner.manager
        .getRepository(DataCubeGroupQuestionsRule)
        .findOne({
          where: { public_group_id: groupQuestionId },
          relations: [
            'datacube_group_questions',
            'datacube_group_questions.datacube_question',
          ],
        });

      if (!groupRule) {
        console.warn(
          'No groupRule found for groupQuestionId:',
          groupQuestionId,
        );
        return {
          custom_parameter_id: cp.id,
          widget_id: cp.widget_id,
          widget_type: 'table',
          macro_function: cp.macro_function,
          columns: [],
          rows: [],
        };
      }

      // 2. Collect all datacube_question_ids under this group
      const questionIds = groupRule.datacube_group_questions.map(
        (gq) => gq.datacube_question.id,
      );

      if (questionIds.length === 0) {
        console.warn('No datacube_question_ids found in groupRule');
      }

      // 3. Fetch TaskQuestionAnswers
      const taskQuestionAnswers = await queryRunner.manager
        .getRepository(TaskQuestionAnswer)
        .createQueryBuilder('tqa')
        .leftJoinAndSelect('tqa.datacube_question', 'dq')
        .leftJoinAndSelect('tqa.task_question', 'tq') // <-- join TaskQuestion
        .leftJoin('tq.task', 'task')
        .leftJoin('task.datacube_frequency', 'freq')
        .leftJoin('freq.datacube', 'dc')
        .leftJoinAndSelect('tqa.parent_option_id', 'option')
        .where('dq.id IN (:...questionIds)', { questionIds })
        .andWhere('tqa.group_questions_rule_id = :groupRuleId', {
          groupRuleId: groupRule.id,
        })
        .andWhere('dc.id = :datacubeId', { datacubeId: datacube_id })
        .andWhere(site_id && site_id !== 'all' ? 'tq.site = :siteId' : '1=1', {
          siteId: site_id,
        })
        .andWhere(
          frequency_id && frequency_id !== 'all'
            ? 'tq.datacube_frequency = :freqId'
            : '1=1',
          { freqId: frequency_id },
        )
        .getMany();

      // -------------------------------
      // 4. Prepare table columns (question + UID)
      // -------------------------------
      const columns = groupRule.datacube_group_questions.map((gq) => ({
        question_id: gq.datacube_question.id,
        question_text: gq.datacube_question.title || '',
        uid: gq.universal_question_id, // ensure UID is stored in datacube_group_questions
      }));

      // -------------------------------
      // 5. Prefetch option texts for answers
      // -------------------------------
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const optionIdSet = new Set<string>();
      for (const tqa of taskQuestionAnswers) {
        const ans = tqa.answer;
        if (Array.isArray(ans)) {
          for (const a of ans)
            if (typeof a === 'string' && uuidRegex.test(a)) optionIdSet.add(a);
        } else if (typeof ans === 'string' && uuidRegex.test(ans))
          optionIdSet.add(ans);
      }

      const optionIds = Array.from(optionIdSet);
      const optionMap = new Map<string, string>();
      if (optionIds.length) {
        const options = await queryRunner.manager
          .getRepository(DataCubeQuestionOption)
          .createQueryBuilder('o')
          .where('o.id IN (:...ids)', { ids: optionIds })
          .getMany();
        for (const o of options) optionMap.set(o.id, o.text);
      }

      const resolveAnswer = (ans: any) => {
        if (Array.isArray(ans))
          return ans.map((a) =>
            uuidRegex.test(a) ? (optionMap.get(a) ?? a) : a,
          );
        if (typeof ans === 'string' && uuidRegex.test(ans))
          return optionMap.get(ans) ?? ans;
        return ans;
      };

      // -------------------------------
      // 6. Organize answers by group sequence + question UID
      // -------------------------------
      const grouped: Record<
        string, // Group_0, Group_1
        Record<string, Record<string, any>> // questionId -> uid -> answer
      > = {};

      for (const tqa of taskQuestionAnswers) {
        const seq = tqa.question_sequence_type || 'Group_0';
        const qid = tqa.datacube_question.id;
        const uid =
          tqa.universal_question_id ?? tqa.id?.toString() ?? 'UID_UNKNOWN';
        if (!grouped[seq]) grouped[seq] = {};
        if (!grouped[seq][qid]) grouped[seq][qid] = {};
        grouped[seq][qid][uid] = resolveAnswer(tqa.answer);
      }

      // -------------------------------
      // 7. Build rows aligned with column UIDs (sorted by group order)
      // -------------------------------
      const rows: any[] = [];

      // Sort groups by Group_0, Group_1, Group_2, etc.
      const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
        const aNum = parseInt(a.replace('Group_', '')) || 0;
        const bNum = parseInt(b.replace('Group_', '')) || 0;
        return aNum - bNum;
      });

      for (const [seq, questionMap] of sortedGroups) {
        const row: any = { group: seq, values: [] };
        for (const col of columns) {
          const qid = col.question_id;
          const { uid } = col;
          const answer = questionMap[qid]?.[uid] ?? null;
          row.values.push(answer);
        }
        rows.push(row);
      }

      // -------------------------------
      // 8. Return final response
      // -------------------------------
      return {
        custom_parameter_id: cp.id,
        widget_id: cp.widget_id,
        widget_type: 'table',
        macro_function: cp.macro_function,
        columns,
        rows,
      };
    } catch (error) {
      console.error('Error processing table:', error);
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  private async processChart(
    cp: CustomParameter,
    widgetType: string,
    datacube_id: string,
    frequency_id: string,
    site_id: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // 1. Fetch the base CP with combined_parameter
      const baseCP = await this.datasource.manager
        .getRepository(CustomParameter)
        .findOne({
          where: { id: cp.id },
          relations: ['combined_parameter'],
        });

      if (!baseCP) return null;

      // 2. Fetch all CPs under the same combined_parameter
      const cpList = await this.datasource.manager
        .getRepository(CustomParameter)
        .find({
          where: { combined_parameter: { id: baseCP.combined_parameter.id } },
        });

      if (!cpList.length) {
        return {
          combined_parameter_id: baseCP.combined_parameter.id,
          widget_id: cp.widget_id,
          widget_type: widgetType,
          combinedParams: [],
        };
      }

      // 3. Collect ALL universal_question_ids from all CPs in the group
      const allQuestionIds = cpList.flatMap((subCP) => subCP.questions);

      // 4. Build TaskQuestion query filters
      const tqWhere: any = {
        universal_question_id: In(allQuestionIds),
      };

      if (frequency_id !== 'all') {
        tqWhere.datacube_frequency = frequency_id;
      } else {
        const matchingDcFreqIds = await queryRunner.manager
          .getRepository(DataCubeFrequency)
          .find({
            where: { datacube: { id: datacube_id } },
            select: ['id'],
          });
        tqWhere.datacube_frequency = In(matchingDcFreqIds.map((dcf) => dcf.id));
      }

      if (site_id !== 'all') {
        tqWhere.site = site_id;
      }

      // 5. Fetch TaskQuestions for all CPs
      const taskQuestions = await queryRunner.manager
        .getRepository(TaskQuestion)
        .find({
          where: tqWhere,
          select: ['id', 'universal_question_id'],
        });

      const taskQuestionIds = taskQuestions.map((tq) => tq.id);

      // 6. Fetch answers for all TaskQuestions
      let cpAnswers: TaskQuestionAnswer[] = [];
      if (taskQuestionIds.length) {
        cpAnswers = await queryRunner.manager
          .getRepository(TaskQuestionAnswer)
          .find({
            where: { task_question: In(taskQuestionIds) },
            select: ['task_question', 'universal_question_id', 'answer'],
          });
      }

      // 7. Build a GLOBAL answerMap across all CPs in this combined group
      const answerMap: Record<string, string[]> = {};
      for (const ans of cpAnswers) {
        const qId = ans.universal_question_id;
        const values = Array.isArray(ans.answer)
          ? ans.answer.map(String)
          : [String(ans.answer ?? '')];
        if (!answerMap[qId]) answerMap[qId] = [];
        answerMap[qId].push(...values);
      }

      // 8. Process each CP inside this combined_parameter
      const combinedParams = [];
      for (const subCP of cpList) {
        const block = await this.processCardOrText(
          subCP,
          widgetType,
          answerMap,
        );
        combinedParams.push(block);
      }

      // 9. Return aggregated chart response
      return {
        combined_parameter_id: baseCP.combined_parameter.id,
        widget_id: cp.widget_id,
        widget_type: widgetType,
        combinedParams,
      };
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
      // Always release the query runner to prevent connection leaks
      await queryRunner.release();
    }
  }

  // ---------------- Helpers for dashboard Analytics----------------

  async getChartFilterResponse(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
    widget_item_id?: string,
    filter1_id?: string,
    filter2_id?: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // -------------------------
      // 1. Detect filter types
      // -------------------------
      const uidRegex = /^UID_\d+$/i;
      const optionFilters: string[] = [];
      const uidFilters: string[] = [];

      [filter1_id, filter2_id].forEach((f) => {
        if (!f) return;
        if (uidRegex.test(f)) uidFilters.push(f);
        else optionFilters.push(f);
      });

      // -------------------------
      // 2. Fetch Custom Parameters for widget_item_id
      // -------------------------
      const customParams = await this.datasource.manager
        .getRepository(CustomParameter)
        .find({
          where: widget_item_id
            ? { combined_parameter: { widget_item: { id: widget_item_id } } }
            : {},
          relations: [
            'combined_parameter',
            'combined_parameter.widget_item',
            'combined_parameter.widget_item.widget_type',
          ],
          select: ['id', 'questions', 'macro_function'],
        });

      if (!customParams.length) return { success: true, response: [] };

      // Map widget types
      const widgetType =
        customParams[0].combined_parameter?.widget_item?.widget_type?.type ||
        'unknown';

      // -------------------------
      // 3. Frequency filter
      // -------------------------
      const matchingDcFreqIds = await queryRunner.manager
        .getRepository(DataCubeFrequency)
        .find({
          where: { datacube: { id: datacube_id } },
          select: ['id'],
        });
      const dcFreqIds = matchingDcFreqIds.map((dcf) => dcf.id);
      if (!dcFreqIds.length) return { success: true, response: [] };

      const freqFilter: string | string[] =
        frequency_id !== 'all' ? frequency_id : dcFreqIds;

      // -------------------------
      // 4. Fetch TaskQuestions for this CP
      // -------------------------
      const allQuestionIds = [
        ...new Set(
          customParams.flatMap((cp) => cp.questions || []).concat(uidFilters),
        ),
      ];

      const tqWhere: any = {
        universal_question_id: In(allQuestionIds),
        datacube_frequency: Array.isArray(freqFilter)
          ? In(freqFilter)
          : freqFilter,
      };
      if (site_id !== 'all') tqWhere.site = site_id;

      const taskQuestions = await queryRunner.manager
        .getRepository(TaskQuestion)
        .find({
          where: tqWhere,
          select: ['id', 'universal_question_id'],
        });

      if (!taskQuestions.length) return { success: true, response: [] };

      const taskQuestionIds = taskQuestions.map((tq) => tq.id);

      // -------------------------
      // 5. Fetch TaskQuestionAnswers
      // -------------------------
      let answers: TaskQuestionAnswer[] = [];
      if (taskQuestionIds.length) {
        answers = await queryRunner.manager
          .getRepository(TaskQuestionAnswer)
          .find({
            where: { task_question: In(taskQuestionIds) },
            select: [
              'task_question',
              'universal_question_id',
              'answer',
              'question_sequence_type',
            ],
          });
      }

      // -------------------------
      // 6. Group-level filtering
      // -------------------------
      const uuidRegex = /^[0-9a-f-]{36}$/i;
      const uuidMap: Record<string, string> = {};
      const answerMap: Record<string, string[]> = {};

      // Separate grouped vs standard answers
      const groupedAnswers = answers.filter((a) =>
        a.question_sequence_type?.startsWith('Group_'),
      );
      const standardAnswers = answers.filter(
        (a) => !a.question_sequence_type?.startsWith('Group_'),
      );

      // --- Handle grouped answers ---
      if (groupedAnswers.length && optionFilters.length) {
        // Identify matching groups
        const matchingGroups = new Set(
          groupedAnswers
            .filter((a) => optionFilters.includes(a.answer as string))
            .map((a) => a.question_sequence_type),
        );

        // Collect all answers from matching groups
        groupedAnswers
          .filter((a) => matchingGroups.has(a.question_sequence_type))
          .forEach((ans) => {
            const qId = ans.universal_question_id;
            const values = Array.isArray(ans.answer)
              ? ans.answer.map(String)
              : [String(ans.answer ?? '')];
            const replaced = values.map((v) =>
              uuidRegex.test(v) ? (uuidMap[v] ?? v) : v,
            );
            if (!answerMap[qId]) answerMap[qId] = [];
            answerMap[qId].push(...replaced);
          });
      }

      // --- Handle standard answers ---
      standardAnswers.forEach((ans) => {
        const qId = ans.universal_question_id;
        if (
          optionFilters.length &&
          !optionFilters.includes(ans.answer as string) &&
          !uidFilters.includes(qId)
        )
          return; // skip if filter does not match

        const values = Array.isArray(ans.answer)
          ? ans.answer.map(String)
          : [String(ans.answer ?? '')];
        const replaced = values.map((v) =>
          uuidRegex.test(v) ? (uuidMap[v] ?? v) : v,
        );
        if (!answerMap[qId]) answerMap[qId] = [];
        answerMap[qId].push(...replaced);
      });

      // -------------------------
      // 7. Process chart using macro function
      // -------------------------
      const results = [];
      if (widgetType === 'chart') {
        results.push(
          await this.processChart(
            customParams[0],
            'chart',
            datacube_id,
            'all',
            'all',
          ),
        );
      }

      return { success: true, response: results };
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? error);
    } finally {
      await queryRunner.release();
    }
  }

  async getDepartmentTaskResponses(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
    department_id: string,
    tab_id?: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    // const publicDataSource = await AppDataSource.initialize();

    try {
      const dashboards = await this.datasource.manager
        .getRepository(Dashboard)
        .find({
          where: { department: { id: department_id } },
          select: ['id'],
        });

      if (!dashboards.length) return { success: true, response: [] };

      const response: any[] = [];

      for (const dashboard of dashboards) {
        const tabs = await this.datasource.manager
          .getRepository(DashboardTab)
          .find({
            where: {
              dashboard: { id: dashboard.id },
              ...(tab_id ? { id: tab_id } : {}),
            },
            select: ['id', 'sequence'],
            order: { sequence: 'ASC' },
          });

        const tabsWithBlocks: any[] = [];

        for (const tab of tabs) {
          // 3 Blocks
          const blocks = await this.datasource.manager
            .getRepository(DashboardBlock)
            .find({
              where: { dashboard_tab: { id: tab.id } },
              select: ['id', 'sequence'],
              order: { sequence: 'ASC' },
            });

          const blocksWithColumns: any[] = [];

          for (const block of blocks) {
            // 4 Columns
            const columns = await this.datasource.manager
              .getRepository(DashboardColumn)
              .find({
                where: { dashboard_block: { id: block.id } },
                select: ['id', 'sequence'],
                order: { sequence: 'ASC' },
              });

            const columnsWithTypes: any[] = [];

            for (const column of columns) {
              // 5 Types
              const types = await this.datasource.manager
                .getRepository(DashboardType)
                .find({
                  where: { dashboard_column: { id: column.id } },
                  select: ['id', 'type', 'latest_data'],
                });

              const typesWithItems: any[] = [];

              for (const type of types) {
                // 6 Items
                const items = await this.datasource.manager
                  .getRepository(DashboardItem)
                  .find({
                    where: { dashboard_type: { id: type.id } },
                    select: ['id'],
                  });

                const itemsWithCombined: any[] = [];

                for (const item of items) {
                  // 7 Combined Parameters
                  const combinedParams = await this.datasource.manager
                    .getRepository(DashboardCombinedParameter)
                    .find({
                      where: { dashboard_item: { id: item.id } },
                      select: ['id'],
                    });

                  const combinedWithCustom: any[] = [];

                  for (const cp of combinedParams) {
                    // 8 Custom Parameters
                    const customParams = await this.datasource.manager
                      .getRepository(DashboardCustomParameter)
                      .find({
                        where: { dashboard_combined_parameter: { id: cp.id } },
                        select: ['id', 'macro_function', 'questions'],
                      });

                    // --------------------------
                    // 9 Fetch answers (per custom param)
                    // --------------------------
                    for (const c of customParams as any[]) {
                      if (c.questions?.length || c.macro_function) {
                        // ----------------------------
                        // 1. Build TaskQuestion filter
                        // ----------------------------
                        const tqWhere: any = {
                          universal_question_id: In(c.questions),
                        };
                        if (type.latest_data) {
                          // fetch latest frequency id (March or Q4)
                          const latestFreq = await queryRunner.manager
                            .getRepository(DataCubeFrequency)
                            .findOne({
                              where: [
                                {
                                  datacube: { id: datacube_id },
                                  frequency_name: Like('%March_%'),
                                },
                                {
                                  datacube: { id: datacube_id },
                                  frequency_name: Like('%Q4%'),
                                },
                              ],
                              select: ['id'],
                            });

                          if (latestFreq) {
                            tqWhere.datacube_frequency = latestFreq.id;
                          }
                        } else {
                          // fallback
                          if (frequency_id !== 'all') {
                            tqWhere.datacube_frequency = frequency_id;
                          } else {
                            const matchingDcFreqIds = await queryRunner.manager
                              .getRepository(DataCubeFrequency)
                              .find({
                                where: { datacube: { id: datacube_id } },
                                select: ['id'],
                              });
                            tqWhere.datacube_frequency = In(
                              matchingDcFreqIds.map((dcf) => dcf.id),
                            );
                          }
                        }

                        if (site_id !== 'all') {
                          tqWhere.site = site_id;
                        }

                        // ----------------------------
                        // 2. Fetch TaskQuestions
                        // ----------------------------
                        const allTaskQuestions = await queryRunner.manager
                          .getRepository(TaskQuestion)
                          .find({
                            where: tqWhere,
                            select: ['id', 'universal_question_id'],
                          });

                        const taskQuestionIds = allTaskQuestions.map(
                          (tq) => tq.id,
                        );

                        // ----------------------------
                        // 3. Fetch Answers
                        // ----------------------------
                        let allAnswers: TaskQuestionAnswer[] = [];
                        if (taskQuestionIds.length) {
                          allAnswers = await queryRunner.manager
                            .getRepository(TaskQuestionAnswer)
                            .find({
                              where: { task_question: In(taskQuestionIds) },
                              select: [
                                'task_question',
                                'universal_question_id',
                                'answer',
                              ],
                            });
                        }

                        // ----------------------------
                        // 4. Map answers per question
                        // ----------------------------
                        const answerMap: Record<string, any[]> = {};
                        for (const ans of allAnswers) {
                          const qId = ans.universal_question_id;
                          const values = Array.isArray(ans.answer)
                            ? ans.answer.map((v) => String(v ?? ''))
                            : [String(ans.answer ?? '')];

                          if (!answerMap[qId]) answerMap[qId] = [];
                          answerMap[qId].push(...values);
                        }

                        // ----------------------------
                        // 5. Aggregate values
                        // ----------------------------
                        if (type.type === 'chart') {
                          // Build chart_data array
                          const chartData: any[] = [];

                          for (const q of c.questions) {
                            const rawValues = answerMap[q] || [];
                            const numbers = rawValues.map((v: string) => {
                              const num = parseFloat(v.split(' ')[0]);
                              return isNaN(num) ? 0 : num;
                            });
                            const sum = numbers.reduce((a, b) => a + b, 0);

                            let unit = '';
                            if (rawValues.length > 0) {
                              const parts = rawValues[0].split(' ');
                              if (parts.length > 1) {
                                unit = parts.slice(1).join(' ');
                              }
                            }

                            chartData.push({
                              question_id: q,
                              value: `${sum}${unit ? ` ${unit}` : ''}`,
                            });
                          }

                          // keep calculated_value as total
                          const totalSum = chartData.reduce((acc, row) => {
                            const num = parseFloat(
                              String(row.value).split(' ')[0],
                            );
                            return acc + (isNaN(num) ? 0 : num);
                          }, 0);

                          let unit = '';
                          if (
                            chartData.length &&
                            chartData[0].value.includes(' ')
                          ) {
                            unit = chartData[0].value
                              .split(' ')
                              .slice(1)
                              .join(' ');
                          }

                          c.calculated_value = `${totalSum}${unit ? ` ${unit}` : ''}`;
                          c.chart_data = chartData;
                        } else if (type.type === 'textArea') {
                          // Just join text answers
                          const rawValues = c.questions.flatMap(
                            (q: string) => answerMap[q] || [],
                          );
                          const text = rawValues.join(' ').trim();
                          c.calculated_value = text || null;
                        } else {
                          // Default card calculation
                          const rawValues = c.questions.flatMap(
                            (q: string) => answerMap[q] || [],
                          );

                          // Parse numbers safely (handle both "num,unit" and "num unit")
                          const numbers = rawValues.map((v: string) => {
                            const parts = v.includes(',')
                              ? v.split(',')
                              : v.split(' ');
                            const num = parseFloat(parts[0]);
                            return isNaN(num) ? 0 : num;
                          });

                          const sum = numbers.reduce((a, b) => a + b, 0);

                          // Extract unit from first value (if available)
                          let firstUnit = '';
                          if (rawValues.length > 0) {
                            const parts = rawValues[0].includes(',')
                              ? rawValues[0].split(',')
                              : rawValues[0].split(' ');

                            if (parts.length > 1) {
                              firstUnit = parts[1].trim();
                            }
                          }

                          // Map unit string to expected type
                          let unitType: 'rupees' | 'kg' | null = null;
                          if (firstUnit.toLowerCase().includes('kg')) {
                            unitType = 'kg';
                          } else if (
                            firstUnit.toLowerCase().includes('rupee') ||
                            firstUnit.toLowerCase().includes('inr')
                          ) {
                            unitType = 'rupees';
                          }

                          if (unitType) {
                            c.calculated_value = this.formatWithUnit(
                              sum,
                              unitType,
                            );
                          } else {
                            // fallback: just show raw with unit
                            c.calculated_value = `${sum}${firstUnit ? ` ${firstUnit}` : ''}`;
                          }
                        }
                      }
                    }

                    combinedWithCustom.push({
                      ...cp,
                      customParams,
                    });
                  }

                  itemsWithCombined.push({
                    ...item,
                    combinedParameters: combinedWithCustom,
                  });
                }

                typesWithItems.push({
                  ...type,
                  items: itemsWithCombined,
                });
              }

              columnsWithTypes.push({
                ...column,
                types: typesWithItems,
              });
            }

            blocksWithColumns.push({
              ...block,
              columns: columnsWithTypes,
            });
          }

          tabsWithBlocks.push({
            ...tab,
            blocks: blocksWithColumns,
          });
        }

        response.push({
          ...dashboard,
          tabs: tabsWithBlocks,
        });
      }

      return { success: true, response: { dashboards: response } };
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? error);
    } finally {
      await queryRunner.release();
      // await publicDataSource.destroy();
    }
  }

  async getStandardTaskResponses(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
    standard_id: string,
    tab_id?: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    // const publicDataSource = await AppDataSource.initialize();

    try {
      const dashboards = await this.datasource.manager
        .getRepository(Dashboard)
        .find({
          where: { standard: { id: standard_id } },
          select: ['id'],
        });

      if (!dashboards.length) return { success: true, response: [] };

      const response: any[] = [];

      for (const dashboard of dashboards) {
        const tabs = await this.datasource.manager
          .getRepository(DashboardTab)
          .find({
            where: {
              dashboard: { id: dashboard.id },
              ...(tab_id ? { id: tab_id } : {}),
            },
            select: ['id', 'sequence'],
            order: { sequence: 'ASC' },
          });

        const tabsWithBlocks: any[] = [];

        for (const tab of tabs) {
          // 3 Blocks
          const blocks = await this.datasource.manager
            .getRepository(DashboardBlock)
            .find({
              where: { dashboard_tab: { id: tab.id } },
              select: ['id', 'sequence'],
              order: { sequence: 'ASC' },
            });

          const blocksWithColumns: any[] = [];

          for (const block of blocks) {
            // 4 Columns
            const columns = await this.datasource.manager
              .getRepository(DashboardColumn)
              .find({
                where: { dashboard_block: { id: block.id } },
                select: ['id', 'sequence'],
                order: { sequence: 'ASC' },
              });

            const columnsWithTypes: any[] = [];

            for (const column of columns) {
              // 5 Types
              const types = await this.datasource.manager
                .getRepository(DashboardType)
                .find({
                  where: { dashboard_column: { id: column.id } },
                  select: ['id', 'type', 'latest_data'],
                });

              const typesWithItems: any[] = [];

              for (const type of types) {
                // 6 Items
                const items = await this.datasource.manager
                  .getRepository(DashboardItem)
                  .find({
                    where: { dashboard_type: { id: type.id } },
                    select: ['id'],
                  });

                const itemsWithCombined: any[] = [];

                for (const item of items) {
                  // 7 Combined Parameters
                  const combinedParams = await this.datasource.manager
                    .getRepository(DashboardCombinedParameter)
                    .find({
                      where: { dashboard_item: { id: item.id } },
                      select: ['id'],
                    });

                  const combinedWithCustom: any[] = [];

                  for (const cp of combinedParams) {
                    // 8 Custom Parameters
                    const customParams = await this.datasource.manager
                      .getRepository(DashboardCustomParameter)
                      .find({
                        where: { dashboard_combined_parameter: { id: cp.id } },
                        select: ['id', 'macro_function', 'questions'],
                      });

                    // --------------------------
                    // 9 Fetch answers (per custom param)
                    // --------------------------
                    for (const c of customParams as any[]) {
                      if (c.questions?.length || c.macro_function) {
                        // ----------------------------
                        // 1. Build TaskQuestion filter
                        // ----------------------------
                        const tqWhere: any = {
                          universal_question_id: In(c.questions),
                        };
                        if (type.latest_data) {
                          // fetch latest frequency id (March or Q4)
                          const latestFreq = await queryRunner.manager
                            .getRepository(DataCubeFrequency)
                            .findOne({
                              where: [
                                {
                                  datacube: { id: datacube_id },
                                  frequency_name: Like('%March_%'),
                                },
                                {
                                  datacube: { id: datacube_id },
                                  frequency_name: Like('%Q4%'),
                                },
                              ],
                              select: ['id'],
                            });

                          if (latestFreq) {
                            tqWhere.datacube_frequency = latestFreq.id;
                          }
                        } else {
                          // fallback
                          if (frequency_id !== 'all') {
                            tqWhere.datacube_frequency = frequency_id;
                          } else {
                            const matchingDcFreqIds = await queryRunner.manager
                              .getRepository(DataCubeFrequency)
                              .find({
                                where: { datacube: { id: datacube_id } },
                                select: ['id'],
                              });
                            tqWhere.datacube_frequency = In(
                              matchingDcFreqIds.map((dcf) => dcf.id),
                            );
                          }
                        }

                        if (site_id !== 'all') {
                          tqWhere.site = site_id;
                        }

                        // ----------------------------
                        // 2. Fetch TaskQuestions
                        // ----------------------------
                        const allTaskQuestions = await queryRunner.manager
                          .getRepository(TaskQuestion)
                          .find({
                            where: tqWhere,
                            select: ['id', 'universal_question_id'],
                          });

                        const taskQuestionIds = allTaskQuestions.map(
                          (tq) => tq.id,
                        );

                        // ----------------------------
                        // 3. Fetch Answers
                        // ----------------------------
                        let allAnswers: TaskQuestionAnswer[] = [];
                        if (taskQuestionIds.length) {
                          allAnswers = await queryRunner.manager
                            .getRepository(TaskQuestionAnswer)
                            .find({
                              where: { task_question: In(taskQuestionIds) },
                              select: [
                                'task_question',
                                'universal_question_id',
                                'answer',
                              ],
                            });
                        }

                        // ----------------------------
                        // 4. Map answers per question
                        // ----------------------------
                        const answerMap: Record<string, any[]> = {};
                        for (const ans of allAnswers) {
                          const qId = ans.universal_question_id;
                          const values = Array.isArray(ans.answer)
                            ? ans.answer.map((v) => String(v ?? ''))
                            : [String(ans.answer ?? '')];

                          if (!answerMap[qId]) answerMap[qId] = [];
                          answerMap[qId].push(...values);
                        }

                        // ----------------------------
                        // 5. Aggregate values
                        // ----------------------------
                        // ----------------------------
                        // 5. Build Map for Macro Evaluation
                        // ----------------------------
                        const currentMapForMacro = new Map<string, any>();
                        for (const qId of c.questions || []) {
                          const rawValues = answerMap[qId] || [];
                          const numbers = rawValues.map((v: string) => {
                            const parts = v.includes(',')
                              ? v.split(',')
                              : v.split(' ');
                            const num = parseFloat(parts[0]);
                            return isNaN(num) ? 0 : num;
                          });
                          const sum = numbers.reduce((a, b) => a + b, 0);
                          currentMapForMacro.set(qId, {
                            consolidated_response: sum,
                          });
                        }

                        if (type.type === 'chart') {
                          // Build chart_data array
                          const chartData: any[] = [];

                          for (const q of c.questions) {
                            const rawValues = answerMap[q] || [];
                            const numbers = rawValues.map((v: string) => {
                              const num = parseFloat(v.split(' ')[0]);
                              return isNaN(num) ? 0 : num;
                            });
                            const sum = numbers.reduce((a, b) => a + b, 0);

                            let unit = '';
                            if (rawValues.length > 0) {
                              const parts = rawValues[0].split(' ');
                              if (parts.length > 1) {
                                unit = parts.slice(1).join(' ');
                              }
                            }

                            chartData.push({
                              question_id: q,
                              value: `${sum}${unit ? ` ${unit}` : ''}`,
                            });
                          }

                          // Calculate Total or Macro for calculated_value
                          let unit = '';
                          if (
                            chartData.length &&
                            String(chartData[0].value).includes(' ')
                          ) {
                            unit = String(chartData[0].value)
                              .split(' ')
                              .slice(1)
                              .join(' ');
                          }

                          let calculatedVal = 0;
                          const macro = c.macro_function?.trim();

                          if (macro) {
                            let expr = macro;
                            c.questions.forEach((qId: string) => {
                              const row = chartData.find(
                                (d) => d.question_id === qId,
                              );
                              const valStr = row
                                ? String(row.value).split(' ')[0]
                                : '0';
                              const val = parseFloat(valStr) || 0;
                              expr = expr.replace(
                                new RegExp(qId, 'g'),
                                String(val),
                              );
                            });

                            try {
                              calculatedVal = Number(eval(expr));
                            } catch {
                              calculatedVal = 0;
                            }
                          } else {
                            calculatedVal = chartData.reduce((acc, row) => {
                              const num = parseFloat(
                                String(row.value).split(' ')[0],
                              );
                              return acc + (isNaN(num) ? 0 : num);
                            }, 0);
                          }

                          c.calculated_value = this.formatReadable(
                            calculatedVal,
                            unit,
                          );
                          c.chart_data = chartData;
                        } else if (type.type === 'textArea') {
                          // Just join text answers
                          const rawValues = c.questions.flatMap(
                            (q: string) => answerMap[q] || [],
                          );
                          const text = rawValues.join(' ').trim();
                          c.calculated_value = text || null;
                        } else {
                          // Default card calculation
                          // Check for macro function
                          const macro = c.macro_function?.trim();

                          if (macro) {
                            const isMixed = (c.questions || []).some((qId) =>
                              (answerMap[qId] || []).some((val) =>
                                val.includes(','),
                              ),
                            );

                            let calculatedVal = 0;
                            let displayUnit = '';

                            if (isMixed) {
                              const parts = c.questions.map((qId) => {
                                const vals = answerMap[qId] || [];
                                return vals.map((val) => {
                                  const [numStr, unit] = val.split(',');
                                  const num = Number(numStr) || 0;
                                  const u = unit ? unit.trim() : '';

                                  const conv = unitConversions[u];
                                  let baseValue = num;
                                  if (conv) {
                                    if (typeof conv.factor === 'number') {
                                      baseValue = num * conv.factor;
                                    } else if (
                                      typeof conv.factor === 'function'
                                    ) {
                                      baseValue = conv.factor(num);
                                    }
                                  }
                                  return {
                                    baseValue,
                                    unit: conv?.baseUnit || u || '',
                                  };
                                });
                              });

                              let expr = macro;
                              c.questions.forEach((qId, idx) => {
                                const numSum = parts[idx].reduce(
                                  (a: any, b: any) => a + b.baseValue,
                                  0,
                                );
                                expr = expr.replace(
                                  new RegExp(qId, 'g'),
                                  String(numSum),
                                );
                              });

                              try {
                                calculatedVal = eval(expr);
                              } catch {
                                calculatedVal = 0;
                              }

                              // displayUnit logic from processCardOrText
                              displayUnit =
                                parts.find((p) => p.length && p[0].unit)?.[0]
                                  .unit || '';
                            } else {
                              // Numeric only
                              let expr = macro;
                              const questionValues = new Map();

                              let hasUnit = false;

                              for (const qId of c.questions) {
                                let qSum = 0;
                                const rawValues = answerMap[qId] || [];
                                rawValues.forEach((val) => {
                                  const vStr = String(val);
                                  // Handle space or comma
                                  const sep = vStr.includes(',') ? ',' : ' ';
                                  const parts = vStr.split(sep);
                                  const num = parseFloat(parts[0]);
                                  if (!isNaN(num)) qSum += num;

                                  if (parts.length > 1 && !hasUnit) {
                                    displayUnit = parts[1].trim();
                                    hasUnit = true;
                                  }
                                });
                                questionValues.set(qId, qSum);
                              }

                              c.questions.forEach((qId) => {
                                const val = questionValues.get(qId) || 0;
                                expr = expr.replace(
                                  new RegExp(qId, 'g'),
                                  String(val),
                                );
                              });

                              try {
                                const result = eval(expr);
                                calculatedVal = Number(result);
                              } catch {
                                calculatedVal = 0;
                              }
                            }

                            c.calculated_value = this.formatReadable(
                              calculatedVal,
                              displayUnit,
                            );
                          } else {
                            // Default card calculation
                            const rawValues = c.questions.flatMap(
                              (q: string) => answerMap[q] || [],
                            );

                            // Parse numbers safely (handle both "num,unit" and "num unit")
                            const numbers = rawValues.map((v: string) => {
                              const parts = v.includes(',')
                                ? v.split(',')
                                : v.split(' ');
                              const num = parseFloat(parts[0]);
                              return isNaN(num) ? 0 : num;
                            });

                            const sum = numbers.reduce((a, b) => a + b, 0);

                            // Extract unit from first value (if available)
                            let firstUnit = '';
                            if (rawValues.length > 0) {
                              const parts = rawValues[0].includes(',')
                                ? rawValues[0].split(',')
                                : rawValues[0].split(' ');

                              if (parts.length > 1) {
                                firstUnit = parts[1].trim();
                              }
                            }

                            // Map unit string to expected type
                            let unitType: 'rupees' | 'kg' | null = null;
                            if (firstUnit.toLowerCase().includes('kg')) {
                              unitType = 'kg';
                            } else if (
                              firstUnit.toLowerCase().includes('rupee') ||
                              firstUnit.toLowerCase().includes('inr')
                            ) {
                              unitType = 'rupees';
                            }

                            if (unitType) {
                              c.calculated_value = this.formatWithUnit(
                                sum,
                                unitType,
                              );
                            } else {
                              // fallback: just show raw with unit
                              c.calculated_value = `${sum}${firstUnit ? ` ${firstUnit}` : ''}`;
                            }
                          }
                        }
                      }
                    }

                    combinedWithCustom.push({
                      ...cp,
                      customParams,
                    });
                  }

                  itemsWithCombined.push({
                    ...item,
                    combinedParameters: combinedWithCustom,
                  });
                }

                typesWithItems.push({
                  ...type,
                  items: itemsWithCombined,
                });
              }

              columnsWithTypes.push({
                ...column,
                types: typesWithItems,
              });
            }

            blocksWithColumns.push({
              ...block,
              columns: columnsWithTypes,
            });
          }

          tabsWithBlocks.push({
            ...tab,
            blocks: blocksWithColumns,
          });
        }

        response.push({
          ...dashboard,
          tabs: tabsWithBlocks,
        });
      }

      return { success: true, response: { dashboards: response } };
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? error);
    } finally {
      await queryRunner.release();
      // await publicDataSource.destroy();
    }
  }

  // ---------------- Helpers for Department Analytics----------------

  async getStandardResponseByDatacube(datacube_id: string) {
    try {
      const datacube = await this.datacubeModel.findOne({
        where: { id: datacube_id },
        relations: TASK_DATACUBE_RELATIONS.map((relation) => relation.path),
      });
      if (!datacube) throw new BadRequestException('Invalid datacube');
      const standards = [];
      for (const standard_id of datacube.standards) {
        const standard = await this.datasource.manager
          .getRepository(Standard)
          .findOne({
            where: { id: standard_id.id },
            relations: JOIN_RELATIONS.map((relation) => relation.path),
          });
        if (!standard) throw new BadRequestException('Invalid standard');

        const standardResponse = {
          id: standard.id,
          name: standard.name,
          modules: [],
        };

        for (const module of standard.standard_modules) {
          const moduleResponse = {
            id: module.master_module.id,
            name: module.master_module.name,
            indicators: [],
          };

          for (const indicator of module.standard_indicators) {
            const indicatorResponse = {
              id: indicator.master_indicator.id,
              name: indicator.master_indicator.name,
              questions: [],
            };

            for (const question_sequence of indicator.question_sequences) {
              const taskQuestion = datacube.datacube_frequency.map(
                (frequency) =>
                  frequency.task?.find((tq) =>
                    tq.task_questions.find(
                      (qs) => qs.id === question_sequence.id,
                    ),
                  ),
              );

              if (taskQuestion) {
                const questionResponse = {
                  id: question_sequence.id,
                  title: question_sequence.standard_question_id?.title,
                  answer:
                    taskQuestion.map((tq) =>
                      tq.task_questions.map(
                        (qs) => qs.task_question_answers?.[0]?.answer,
                      ),
                    ) || null,
                  comments:
                    taskQuestion.map((tq) =>
                      tq.task_questions.map((qs) => qs.task_comments),
                    ) || [],
                };
                indicatorResponse.questions.push(questionResponse);
              }
            }

            moduleResponse.indicators.push(indicatorResponse);
          }

          standardResponse.modules.push(moduleResponse);
        }

        standards.push(standardResponse);
      }

      return {
        success: true,
        standards,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getDashboardResponses(
    dataCube_id: string,
    frequency_id: string,
    site_id: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    queryRunner.connect();
    try {
      const dashboard = await this.datasource.manager
        .getRepository(Dashboard)
        .find({
          relations: [
            'department.standardQuestions',
            'department',
            'tabs',
            'tabs.dashboard_blocks',
            'tabs.dashboard_blocks.dashboard_columns',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
          ],
        });
      if (!dashboard) {
        throw new BadRequestException('Dashboard not found');
      }
      const responses = await Promise.all(
        dashboard.map(async (d_board) => {
          const departmentResponse = {
            id: d_board.id,
            name: d_board.name,
            sequence: d_board.sequence,
            number_of_tabs: d_board.number_of_tabs,
            department: {
              id: d_board.department?.id,
              name: d_board.department?.name,
            },
            tabs: await Promise.all(
              d_board.tabs.map(async (tab) => {
                const tabResponse = {
                  id: tab.id,
                  name: tab.name,
                  sequence: tab.sequence,
                  number_of_blocks: tab.number_of_blocks,
                  dashboard_blocks: await Promise.all(
                    tab.dashboard_blocks.map(async (block) => {
                      const blockResponse = {
                        id: block.id,
                        sequence: block.sequence,
                        number_of_columns: block.number_of_columns,
                        dashboard_columns: await Promise.all(
                          block.dashboard_columns.map(async (column) => {
                            const columnResponse = {
                              id: column.id,
                              sequence: column.sequence,
                              number_of_items: column.number_of_items,
                              dashboard_types: await Promise.all(
                                column.dashboard_types.map(async (type) => {
                                  const typeResponse = {
                                    id: type.id,
                                    type: type.type,
                                    chart_type: type.chart_type,
                                    is_stacked: type.is_stacked,
                                    is_horizontal: type.is_horizontal,
                                    is_metric: type.is_metric,
                                    dashboard_items: await Promise.all(
                                      type.dashboard_items.map(async (item) => {
                                        const itemResponse = {
                                          id: item.id,
                                          title: item.title,
                                          dashboard_combined_parameters:
                                            await Promise.all(
                                              item.dashboard_combined_parameters.map(
                                                async (combinedParam) => {
                                                  const combinedParamResponse =
                                                    {
                                                      id: combinedParam.id,
                                                      name: combinedParam.name,
                                                      dashboard_custom_parameters:
                                                        await Promise.all(
                                                          combinedParam.dashboard_custom_parameters.map(
                                                            async (
                                                              customParam,
                                                            ) => {
                                                              // Get responses based on questions array
                                                              const questions =
                                                                customParam.questions ||
                                                                [];

                                                              const questionResponses =
                                                                await Promise.all(
                                                                  questions.map(
                                                                    async (
                                                                      questionId,
                                                                    ) => {
                                                                      const datacube_question =
                                                                        await this.datacubeQuestionRepository.findOne(
                                                                          {
                                                                            where:
                                                                              {
                                                                                universal_question_id:
                                                                                  questionId,
                                                                              },
                                                                          },
                                                                        );
                                                                      if (
                                                                        !datacube_question
                                                                      ) {
                                                                        throw new BadRequestException(
                                                                          `Datacube question with public_question_id ${questionId} not found`,
                                                                        );
                                                                      }
                                                                      const response =
                                                                        await queryRunner.manager
                                                                          .getRepository(
                                                                            TaskQuestionAnswer,
                                                                          )
                                                                          .findOne(
                                                                            {
                                                                              where:
                                                                                {
                                                                                  universal_question_id:
                                                                                    datacube_question.universal_question_id,
                                                                                  task_question:
                                                                                    {
                                                                                      task: {
                                                                                        datacube_frequency:
                                                                                          {
                                                                                            id: frequency_id,
                                                                                            datacube:
                                                                                              {
                                                                                                id: dataCube_id,
                                                                                              },
                                                                                          },
                                                                                        site: {
                                                                                          id: site_id,
                                                                                        },
                                                                                      },
                                                                                    },
                                                                                },
                                                                              relations:
                                                                                [
                                                                                  'datacube_question.datacube_question_options',
                                                                                  'datacube_question.mixed_questions',
                                                                                ],
                                                                              // relations: ['datacube_question', 'task_question']
                                                                            },
                                                                          );

                                                                      return {
                                                                        task_responses:
                                                                          response,
                                                                      };
                                                                    },
                                                                  ),
                                                                );

                                                              let answer;
                                                              if (
                                                                customParam.macro_function
                                                              ) {
                                                                const answerMap =
                                                                  {};
                                                                questions.forEach(
                                                                  (
                                                                    questionId,
                                                                    index,
                                                                  ) => {
                                                                    answerMap[
                                                                      questionId
                                                                    ] =
                                                                      questionResponses[
                                                                        index
                                                                      ]?.task_responses?.answer;
                                                                  },
                                                                );

                                                                let calculation =
                                                                  customParam.macro_function;
                                                                Object.entries(
                                                                  answerMap,
                                                                ).forEach(
                                                                  ([
                                                                    questionId,
                                                                    ans,
                                                                  ]) => {
                                                                    calculation =
                                                                      calculation.replace(
                                                                        questionId,
                                                                        String(
                                                                          ans,
                                                                        ),
                                                                      );
                                                                  },
                                                                );
                                                                try {
                                                                  if (
                                                                    !/^[0-9+\-*/().\s]+$/.test(
                                                                      calculation,
                                                                    )
                                                                  ) {
                                                                    throw new Error(
                                                                      'Invalid mathematical expression',
                                                                    );
                                                                  }
                                                                  answer =
                                                                    Function(
                                                                      `"use strict";return (${calculation})`,
                                                                    )();
                                                                } catch (err) {
                                                                  console.error(
                                                                    `Error evaluating formula ${calculation}:`,
                                                                    err,
                                                                  );
                                                                  answer = 0;
                                                                }
                                                              } else {
                                                                answer =
                                                                  questionResponses.map(
                                                                    (
                                                                      response,
                                                                    ) =>
                                                                      response
                                                                        ?.task_responses
                                                                        ?.answer,
                                                                  );
                                                              }

                                                              return {
                                                                id: customParam.id,
                                                                name: customParam.name,
                                                                questions:
                                                                  customParam.questions,
                                                                macro_function:
                                                                  customParam.macro_function,
                                                                unit: customParam.unit,
                                                                legends:
                                                                  customParam.legends,
                                                                label:
                                                                  customParam.label,
                                                                answer,
                                                                question_responses:
                                                                  questionResponses,
                                                              };
                                                            },
                                                          ),
                                                        ),
                                                    };
                                                  return combinedParamResponse;
                                                },
                                              ),
                                            ),
                                        };
                                        return itemResponse;
                                      }),
                                    ),
                                  };
                                  return typeResponse;
                                }),
                              ),
                            };
                            return columnResponse;
                          }),
                        ),
                      };
                      return blockResponse;
                    }),
                  ),
                };
                return tabResponse;
              }),
            ),
          };
          return departmentResponse;
        }),
      );
      return {
        success: true,
        data: responses,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getDashboardResponsesV2(
    dataCube_id: string,
    frequency_id: string,
    site_id: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    queryRunner.connect();
    try {
      const dashboard = await this.datasource.manager
        .getRepository(Dashboard)
        .find({
          relations: [
            'department.standardQuestions',
            'department',
            'tabs',
            'tabs.dashboard_blocks',
            'tabs.dashboard_blocks.dashboard_columns',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
          ],
        });
      if (!dashboard) {
        throw new BadRequestException('Dashboard not found');
      }

      // Helper for unit conversion logic
      const findUnitConversion = (unit: string) => {
        if (!unit) return null;
        const cleanUnit = unit.trim().toLowerCase();
        if (!cleanUnit) return null;
        if (unitConversions[unit?.trim()]) return unitConversions[unit?.trim()];
        for (const [key, value] of Object.entries(unitConversions)) {
          const keyLower = key.toLowerCase();
          if (cleanUnit.includes('tons') && keyLower.includes('tonnes'))
            return { baseUnit: 'kg', factor: 1000 };
          if (cleanUnit.includes('kg') && keyLower.includes('kilogram'))
            return { baseUnit: 'kg', factor: 1 };
          if (cleanUnit.includes('m3') && keyLower.includes('cubic meter'))
            return { baseUnit: 'L', factor: 1000 };
          if (cleanUnit.includes('l') && keyLower.includes('liter'))
            return { baseUnit: 'L', factor: 1 };
          if (cleanUnit.includes('miles') && keyLower.includes('mile'))
            return { baseUnit: 'km', factor: 1.609344 };
          if (cleanUnit.includes('km') && keyLower.includes('kilometer'))
            return { baseUnit: 'km', factor: 1 };
          if (cleanUnit.includes('inr') && keyLower.includes('₹'))
            return { baseUnit: 'INR', factor: 1 };
          if (cleanUnit.includes('rupee') && keyLower.includes('₹'))
            return { baseUnit: 'INR', factor: 1 };
        }
        return null;
      };

      const responses = await Promise.all(
        dashboard.map(async (d_board) => {
          const departmentResponse = {
            id: d_board.id,
            name: d_board.name,
            sequence: d_board.sequence,
            number_of_tabs: d_board.number_of_tabs,
            department: {
              id: d_board.department?.id,
              name: d_board.department?.name,
            },
            tabs: await Promise.all(
              d_board.tabs.map(async (tab) => {
                const tabResponse = {
                  id: tab.id,
                  name: tab.name,
                  sequence: tab.sequence,
                  number_of_blocks: tab.number_of_blocks,
                  dashboard_blocks: await Promise.all(
                    tab.dashboard_blocks.map(async (block) => {
                      const blockResponse = {
                        id: block.id,
                        sequence: block.sequence,
                        number_of_columns: block.number_of_columns,
                        dashboard_columns: await Promise.all(
                          block.dashboard_columns.map(async (column) => {
                            const columnResponse = {
                              id: column.id,
                              sequence: column.sequence,
                              number_of_items: column.number_of_items,
                              dashboard_types: await Promise.all(
                                column.dashboard_types.map(async (type) => {
                                  const typeResponse = {
                                    id: type.id,
                                    type: type.type,
                                    chart_type: type.chart_type,
                                    is_stacked: type.is_stacked,
                                    is_horizontal: type.is_horizontal,
                                    is_metric: type.is_metric,
                                    dashboard_items: await Promise.all(
                                      type.dashboard_items.map(async (item) => {
                                        const itemResponse = {
                                          id: item.id,
                                          title: item.title,
                                          dashboard_combined_parameters:
                                            await Promise.all(
                                              item.dashboard_combined_parameters.map(
                                                async (combinedParam) => {
                                                  const combinedParamResponse =
                                                    {
                                                      id: combinedParam.id,
                                                      name: combinedParam.name,
                                                      dashboard_custom_parameters:
                                                        await Promise.all(
                                                          combinedParam.dashboard_custom_parameters.map(
                                                            async (
                                                              customParam,
                                                            ) => {
                                                              const questions =
                                                                customParam.questions ||
                                                                [];

                                                              // 1. Identify Groups and Expand UIDs for fetching
                                                              const effectiveUIDMap =
                                                                new Map<
                                                                  string,
                                                                  string[]
                                                                >();
                                                              if (
                                                                questions.length >
                                                                0
                                                              ) {
                                                                const questionSequences =
                                                                  await queryRunner.manager
                                                                    .getRepository(
                                                                      DataCubeQuestionSequences,
                                                                    )
                                                                    .createQueryBuilder(
                                                                      'qs',
                                                                    )
                                                                    .leftJoinAndSelect(
                                                                      'qs.group_question_rule',
                                                                      'gqr',
                                                                    )
                                                                    .where(
                                                                      'qs.datacube = :datacube_id',
                                                                      {
                                                                        datacube_id:
                                                                          dataCube_id,
                                                                      },
                                                                    )
                                                                    .andWhere(
                                                                      'qs.universal_question_id IN (:...questions)',
                                                                      {
                                                                        questions,
                                                                      },
                                                                    )
                                                                    .getMany();

                                                                for (const qId of questions) {
                                                                  const qs =
                                                                    questionSequences.find(
                                                                      (q) =>
                                                                        q.universal_question_id ===
                                                                        qId,
                                                                    );
                                                                  if (
                                                                    qs &&
                                                                    qs.group_question_rule
                                                                  ) {
                                                                    const groupQuestions =
                                                                      await queryRunner.manager
                                                                        .getRepository(
                                                                          DataCubeGroupQuestions,
                                                                        )
                                                                        .find({
                                                                          where:
                                                                            {
                                                                              group_question_rule:
                                                                                {
                                                                                  id: qs
                                                                                    .group_question_rule
                                                                                    .id,
                                                                                },
                                                                            },
                                                                          select:
                                                                            [
                                                                              'universal_question_id',
                                                                            ],
                                                                          order:
                                                                            {
                                                                              group_sequence:
                                                                                'ASC',
                                                                            },
                                                                        });
                                                                    const children =
                                                                      groupQuestions.map(
                                                                        (g) =>
                                                                          g.universal_question_id,
                                                                      );
                                                                    effectiveUIDMap.set(
                                                                      qId,
                                                                      children.length
                                                                        ? children
                                                                        : [qId],
                                                                    );
                                                                  } else {
                                                                    effectiveUIDMap.set(
                                                                      qId,
                                                                      [qId],
                                                                    );
                                                                  }
                                                                }
                                                              }

                                                              const questionResponses =
                                                                await Promise.all(
                                                                  questions.map(
                                                                    async (
                                                                      questionId,
                                                                    ) => {
                                                                      const uidsToFetch =
                                                                        effectiveUIDMap.get(
                                                                          questionId,
                                                                        ) || [
                                                                          questionId,
                                                                        ];

                                                                      const taskWhere: any =
                                                                        {
                                                                          datacube_frequency:
                                                                            {
                                                                              datacube:
                                                                                {
                                                                                  id: dataCube_id,
                                                                                },
                                                                            },
                                                                        };
                                                                      if (
                                                                        frequency_id !==
                                                                        'all'
                                                                      )
                                                                        taskWhere.datacube_frequency.id =
                                                                          frequency_id;
                                                                      if (
                                                                        site_id !==
                                                                        'all'
                                                                      )
                                                                        taskWhere.site =
                                                                          {
                                                                            id: site_id,
                                                                          };

                                                                      const responses =
                                                                        await queryRunner.manager
                                                                          .getRepository(
                                                                            TaskQuestionAnswer,
                                                                          )
                                                                          .find(
                                                                            {
                                                                              where:
                                                                                {
                                                                                  universal_question_id:
                                                                                    In(
                                                                                      uidsToFetch,
                                                                                    ),
                                                                                  task_question:
                                                                                    {
                                                                                      task: taskWhere,
                                                                                    },
                                                                                },
                                                                              relations:
                                                                                [
                                                                                  'datacube_question.datacube_question_options',
                                                                                  'datacube_question.mixed_questions',
                                                                                ],
                                                                            },
                                                                          );

                                                                      let consolidatedAnswer:
                                                                        | string
                                                                        | number
                                                                        | null =
                                                                        null;
                                                                      if (
                                                                        responses.length >
                                                                        0
                                                                      ) {
                                                                        const values =
                                                                          responses
                                                                            .flatMap(
                                                                              (
                                                                                r,
                                                                              ) =>
                                                                                Array.isArray(
                                                                                  r.answer,
                                                                                )
                                                                                  ? r.answer
                                                                                  : [
                                                                                      r.answer,
                                                                                    ],
                                                                            )
                                                                            .filter(
                                                                              (
                                                                                v,
                                                                              ) =>
                                                                                v !==
                                                                                  null &&
                                                                                v !==
                                                                                  undefined &&
                                                                                v !==
                                                                                  '',
                                                                            );

                                                                        if (
                                                                          values.length >
                                                                          0
                                                                        ) {
                                                                          const isMixed =
                                                                            values.some(
                                                                              (
                                                                                val,
                                                                              ) =>
                                                                                String(
                                                                                  val,
                                                                                ).includes(
                                                                                  ',',
                                                                                ),
                                                                            );
                                                                          if (
                                                                            isMixed
                                                                          ) {
                                                                            let sum = 0;
                                                                            values.forEach(
                                                                              (
                                                                                val,
                                                                              ) => {
                                                                                const parts =
                                                                                  String(
                                                                                    val,
                                                                                  ).split(
                                                                                    ',',
                                                                                  );
                                                                                const num =
                                                                                  parseFloat(
                                                                                    parts[0],
                                                                                  ) ||
                                                                                  0;
                                                                                const unit =
                                                                                  parts[1] ||
                                                                                  '';
                                                                                const conv =
                                                                                  findUnitConversion(
                                                                                    unit,
                                                                                  );
                                                                                let baseValue =
                                                                                  num;
                                                                                if (
                                                                                  conv
                                                                                ) {
                                                                                  if (
                                                                                    typeof conv.factor ===
                                                                                    'number'
                                                                                  )
                                                                                    baseValue =
                                                                                      num *
                                                                                      conv.factor;
                                                                                  else if (
                                                                                    typeof conv.factor ===
                                                                                    'function'
                                                                                  )
                                                                                    baseValue =
                                                                                      conv.factor(
                                                                                        num,
                                                                                      );
                                                                                }
                                                                                sum +=
                                                                                  baseValue;
                                                                              },
                                                                            );
                                                                            consolidatedAnswer =
                                                                              sum;
                                                                          } else {
                                                                            let sum = 0;
                                                                            let isAllNumeric = true;
                                                                            for (const v of values) {
                                                                              const numStr =
                                                                                String(
                                                                                  v,
                                                                                ).replace(
                                                                                  /,/g,
                                                                                  '',
                                                                                );
                                                                              const num =
                                                                                parseFloat(
                                                                                  numStr,
                                                                                );
                                                                              if (
                                                                                !isNaN(
                                                                                  num,
                                                                                )
                                                                              )
                                                                                sum +=
                                                                                  num;
                                                                              else
                                                                                isAllNumeric = false;
                                                                            }
                                                                            consolidatedAnswer =
                                                                              isAllNumeric
                                                                                ? sum
                                                                                : values[0];
                                                                          }
                                                                        }
                                                                      }

                                                                      return {
                                                                        task_responses:
                                                                          {
                                                                            answer:
                                                                              consolidatedAnswer,
                                                                          },
                                                                      };
                                                                    },
                                                                  ),
                                                                );

                                                              let answer;
                                                              if (
                                                                customParam.macro_function
                                                              ) {
                                                                const currentMap =
                                                                  new Map();
                                                                questions.forEach(
                                                                  (
                                                                    qId,
                                                                    idx,
                                                                  ) => {
                                                                    currentMap.set(
                                                                      qId,
                                                                      {
                                                                        consolidated_response:
                                                                          questionResponses[
                                                                            idx
                                                                          ]
                                                                            ?.task_responses
                                                                            ?.answer,
                                                                      },
                                                                    );
                                                                  },
                                                                );
                                                                answer =
                                                                  this.evaluateMacroExpression(
                                                                    customParam.macro_function,
                                                                    questions,
                                                                    currentMap,
                                                                    null,
                                                                    null,
                                                                  );
                                                              } else {
                                                                answer =
                                                                  questionResponses.map(
                                                                    (r) =>
                                                                      r
                                                                        ?.task_responses
                                                                        ?.answer,
                                                                  );
                                                              }

                                                              return {
                                                                id: customParam.id,
                                                                name: customParam.name,
                                                                questions:
                                                                  customParam.questions,
                                                                macro_function:
                                                                  customParam.macro_function,
                                                                unit: customParam.unit,
                                                                legends:
                                                                  customParam.legends,
                                                                label:
                                                                  customParam.label,
                                                                answer,
                                                                question_responses:
                                                                  questionResponses,
                                                              };
                                                            },
                                                          ),
                                                        ),
                                                    };
                                                  return combinedParamResponse;
                                                },
                                              ),
                                            ),
                                        };
                                        return itemResponse;
                                      }),
                                    ),
                                  };
                                  return typeResponse;
                                }),
                              ),
                            };
                            return columnResponse;
                          }),
                        ),
                      };
                      return blockResponse;
                    }),
                  ),
                };
                return tabResponse;
              }),
            ),
          };
          return departmentResponse;
        }),
      );
      return {
        success: true,
        data: responses,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async consolidatedReport(standard_id: string, datacube_id: string) {
    const queryRunner = this.connection.createQueryRunner();
    queryRunner.connect();

    try {
      const datacube = await queryRunner.manager
        .getRepository(Datacube)
        .findOne({
          where: { id: datacube_id },
        });
      if (!datacube) {
        throw new BadRequestException('Datacube not found');
      }

      const consolidatedResponse = await this.consolidatedAnswer(
        standard_id,
        datacube,
      );
      return {
        success: true,
        data: consolidatedResponse,
      };
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
      // await publicDataSource.destroy();
    }
  }

  /**
   * Helper method to find previous year and prior year datacubes
   *
   * This method calculates the financial years for previous year (current - 1)
   * and prior year (current - 2) based on the current datacube's financial year.
   * It then searches for datacubes with the same name but different financial years.
   *
   * @param datacube - The current datacube
   * @param queryRunner - Database query runner
   * @returns Object containing previousYearDatacube and priorYearDatacube
   */
  private async findRelatedYearDatacubes(datacube: Datacube, queryRunner: any) {
    const [startYear, endYear] = datacube.financial_year
      .split('-')
      .map((year) => parseInt(year));

    const previousYearFinancialYear = `${startYear - 1}-${endYear - 1}`;
    const priorYearFinancialYear = `${startYear - 2}-${endYear - 2}`;

    const [previousYearDatacube, priorYearDatacube] = await Promise.all([
      queryRunner.manager.getRepository(Datacube).findOne({
        where: {
          financial_year: previousYearFinancialYear,
          name: datacube.name, // Assuming same datacube name for different years
        },
      }),
      queryRunner.manager.getRepository(Datacube).findOne({
        where: {
          financial_year: priorYearFinancialYear,
          name: datacube.name,
        },
      }),
    ]);

    return {
      previousYearDatacube,
      priorYearDatacube,
    };
  }

  /**
   * Load all consolidated responses for a datacube into a Map keyed by universal_question_id
   */
  private async loadResponsesMap(
    queryRunner: any,
    datacubeId: string,
    questionIds: string[],
  ): Promise<Map<string, ConsolidatedResponse>> {
    const map = new Map<string, ConsolidatedResponse>();
    if (!datacubeId || !questionIds || questionIds.length === 0) return map;

    const responses = await queryRunner.manager
      .getRepository(ConsolidatedResponse)
      .find({
        where: {
          datacube: { id: datacubeId },
          universal_question_id: In(questionIds),
        },
      });

    for (const r of responses) {
      map.set(r.universal_question_id, r);
    }
    return map;
  }

  /**
   * Build and evaluate a macro expression using values from the provided response maps
   */
  private evaluateMacroExpression(
    rawExpression: string,
    questionIdsForExpression: string[],
    currentMap: Map<string, ConsolidatedResponse>,
    prevMap: Map<string, ConsolidatedResponse> | null,
    priorMap: Map<string, ConsolidatedResponse> | null,
  ): number | string {
    let macroExpression = rawExpression || '';

    // Text-only macro (comma-separated labels)
    if (!/[0-9+\-*/().]/.test(macroExpression)) {
      const textParts = macroExpression
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part !== '');
      const uniqueTextParts = [...new Set(textParts)];
      return uniqueTextParts.join(',');
    }

    // Replace placeholders with numeric values from maps
    for (const qId of questionIdsForExpression) {
      const cur = currentMap.get(qId)?.consolidated_response ?? '';
      // Check if value is empty/null/undefined first, then check if it's a valid number
      let curNum = '0';
      if (cur && cur !== '' && cur !== null && cur !== undefined) {
        curNum = isNaN(Number(cur)) ? '0' : Number(cur).toString();
      }
      macroExpression = macroExpression.replace(new RegExp(qId, 'g'), curNum);

      if (prevMap) {
        const prev = prevMap.get(qId)?.consolidated_response ?? '';
        let prevNum = '0';
        if (prev && prev !== '' && prev !== null && prev !== undefined) {
          prevNum = isNaN(Number(prev)) ? '0' : Number(prev).toString();
        }
        macroExpression = macroExpression.replace(
          new RegExp(`${qId}_PREV`, 'g'),
          prevNum,
        );
      }

      if (priorMap) {
        const prior = priorMap.get(qId)?.consolidated_response ?? '';
        let priorNum = '0';
        if (prior && prior !== '' && prior !== null && prior !== undefined) {
          priorNum = isNaN(Number(prior)) ? '0' : Number(prior).toString();
        }
        macroExpression = macroExpression.replace(
          new RegExp(`${qId}_PRIOR`, 'g'),
          priorNum,
        );
      }
    }

    // Clean up any remaining UID placeholders
    macroExpression = macroExpression.replace(/UID_\d+/g, '0');

    // Fix missing multiplication operators
    macroExpression = macroExpression.replace(/(\d+)\s*\(/g, '$1*(');
    macroExpression = macroExpression.replace(/\)\s*(\d+)/g, ')*$1');

    // Remove non-math chars
    macroExpression = macroExpression.replace(/[^0-9+\-*/().\s,]/g, '0');

    // Remove leading zeros to prevent octal literal errors in strict mode
    macroExpression = macroExpression.replace(/\b0+(\d+)/g, '$1');

    if (!/^[0-9+\-*/().\s,]+$/.test(macroExpression)) {
      throw new Error(`Invalid mathematical expression: ${macroExpression}`);
    }
    if (!macroExpression.trim()) {
      throw new Error('Empty mathematical expression');
    }

    try {
      const result = Function(`"use strict";return (${macroExpression})`)();
      return typeof result === 'number' ? Number(result.toFixed(2)) : result;
    } catch (e) {
      console.error(`Error evaluating expression: ${macroExpression}`, e);
      return 0;
    }
  }

  /**
   * Consolidated Answer method with Previous Year and Prior Year support
   *
   * This method processes standard template questions and their responses, including:
   * 1. Current year responses from the provided datacube
   * 2. Previous year responses (if is_previous_year flag is true)
   * 3. Prior year responses (if is_prior_year flag is true)
   *
   * For macro functions, it supports:
   * - Current year values: UID_123
   * - Previous year values: UID_123_PREV
   * - Prior year values: UID_123_PRIOR
   *
   * @param standard_id - The standard template ID
   * @param datacube - The current datacube
   * @returns Consolidated data with current, previous, and prior year values
   */
  async consolidatedAnswer(standard_id: string, datacube: Datacube) {
    const queryRunner = this.connection.createQueryRunner();
    queryRunner.connect();

    try {
      const standard = await this.datasource.manager
        .getRepository(StandardTemplate)
        .findOne({
          where: { standard: { id: standard_id } },
          relations: ['standard_template_question'],
        });
      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      // Find related year datacubes for previous/prior year calculations
      const { previousYearDatacube, priorYearDatacube } =
        await this.findRelatedYearDatacubes(datacube, queryRunner);

      // Collect all UID references we might need
      const allQuestionIds = Array.from(
        new Set(
          (standard.standard_template_question || []).flatMap(
            (q) => q.standard_questions || [],
          ),
        ),
      );

      // Build maps for current and conditional previous/prior years
      const currentMap = await this.loadResponsesMap(
        queryRunner,
        datacube.id,
        allQuestionIds,
      );

      const needsPrev = standard.standard_template_question.some(
        (q) => q.is_previous_year,
      );
      const needsPrior = standard.standard_template_question.some(
        (q) => q.is_prior_year,
      );

      const prevMap =
        needsPrev && previousYearDatacube
          ? await this.loadResponsesMap(
              queryRunner,
              previousYearDatacube.id,
              allQuestionIds,
            )
          : null;
      const priorMap =
        needsPrior && priorYearDatacube
          ? await this.loadResponsesMap(
              queryRunner,
              priorYearDatacube.id,
              allQuestionIds,
            )
          : null;

      const standardResponses = await Promise.all(
        standard.standard_template_question.map(async (question) => {
          // Resolve primary response for the first question id (legacy behavior)
          const firstQid = question.standard_questions?.[0];
          const baseResponse = firstQid ? currentMap.get(firstQid) : null;

          let calculatedAnswer: any = null;
          if (baseResponse?.consolidated_response) {
            if (
              !question.macro_function ||
              question.macro_function.trim() === ''
            ) {
              if (
                question.standard_questions &&
                question.standard_questions.length > 1
              ) {
                const allText = (question.standard_questions || [])
                  .map(
                    (qId) => currentMap.get(qId)?.consolidated_response || '',
                  )
                  .filter((v) => v && String(v).trim() !== '');

                const hasDuplicates = new Set(allText).size !== allText.length;
                const totalWordCount = allText
                  .join(' ')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;

                if (hasDuplicates || totalWordCount > 30) {
                  try {
                    const body = {
                      webpageContent: 'analyticsrephrase',
                      text: allText.join(' '),
                    } as any;
                    const result =
                      await this.chatbotService.handleAiRequest(body);
                    const summarized = (result?.text || '').trim();
                    calculatedAnswer = summarized || allText.join(',');
                  } catch (e) {
                    // If AI request fails (e.g. too large or quota exceeded), use the first value
                    calculatedAnswer = allText[0];
                  }
                } else {
                  const unique = [...new Set(allText)];
                  calculatedAnswer = unique.join(',');
                }
              } else {
                const val = baseResponse.consolidated_response;
                if (val && String(val).includes(',')) {
                  const textParts = String(val)
                    .split(',')
                    .map((part) => part.trim())
                    .filter((part) => part !== '');
                  const uniqueTextParts = [...new Set(textParts)];
                  calculatedAnswer = uniqueTextParts.join(',');
                } else {
                  calculatedAnswer = val;
                }
              }
            } else {
              try {
                calculatedAnswer = this.evaluateMacroExpression(
                  question.macro_function,
                  question.standard_questions || [],
                  currentMap,
                  question.is_previous_year ? prevMap : null,
                  question.is_prior_year ? priorMap : null,
                );
              } catch (error) {
                console.error(
                  `Error evaluating macro function for question ${question.id}:`,
                  error,
                );
                calculatedAnswer = 0;
              }
            }
          }

          return {
            id: question.id,
            title: question.question_title,
            answer: calculatedAnswer || null,
            consolidated_response: baseResponse?.consolidated_response || null,
            previousYearResponse:
              question.is_previous_year && firstQid && prevMap
                ? prevMap.get(firstQid)?.consolidated_response || null
                : null,
            priorYearResponse:
              question.is_prior_year && firstQid && priorMap
                ? priorMap.get(firstQid)?.consolidated_response || null
                : null,
            is_previous_year: question.is_previous_year,
            is_prior_year: question.is_prior_year,
          };
        }),
      );
      const consolidatedData = {};
      standardResponses.forEach((response) => {
        if (response && response.title && response.answer !== undefined) {
          const key = response.title;
          const value = response.answer
            ? response.answer
            : response.consolidated_response;

          // Create a comprehensive response object
          consolidatedData[key] = {
            currentYear: value,
            previousYear: response.previousYearResponse,
            priorYear: response.priorYearResponse,
            // is_previous_year: response.is_previous_year,
            // is_prior_year: response.is_prior_year,
          };
        }
      });
      return consolidatedData;
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
      // await publicDataSource.destroy();
    }
  }

  async getReportProgress(standard_id: string, datacube_id: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // === Validate datacube ===
      const datacube = await queryRunner.manager
        .getRepository(Datacube)
        .findOne({ where: { id: datacube_id } });

      if (!datacube) {
        throw new BadRequestException('Datacube not found');
      }

      // === Validate standard ===
      const standard = await this.datasource.manager
        .getRepository(Standard)
        .findOne({ where: { id: standard_id } });

      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      // === Clone datacube (modules + indicators + questions) ===
      const clonedData = await this.datacubeClone([standard_id]);

      const totalModules = clonedData.length;

      const totalIndicators = clonedData.reduce(
        (acc, module) => acc + (module.indicators?.length || 0),
        0,
      );

      // === Fetch ALL tasks for this datacube ===
      const tasksResponse = await this.getTaskByDatacubefrequency(datacube_id, {
        filter: {},
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
        sort: 'createdAt',
      });

      // Flatten all tasks
      const allTasks = tasksResponse.datacube.flatMap(
        (frequency) => frequency.task,
      );

      // === Module Completion Stats (do NOT change shape) ===
      const moduleStats: Record<string, { total: number; completed: number }> =
        {};

      allTasks.forEach((task) => {
        const moduleName = task.module_name || 'Unknown';

        if (!moduleStats[moduleName]) {
          moduleStats[moduleName] = { total: 0, completed: 0 };
        }

        moduleStats[moduleName].total += 1;

        if (task.status === 'COMPLETED') {
          moduleStats[moduleName].completed += 1;
        }
      });

      const moduleProgress = Object.entries(moduleStats).map(
        ([moduleName, stats]) => {
          const percentage =
            stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
          return {
            module_name: moduleName,
            completed: stats.completed,
            total: stats.total,
            percentage: Number(percentage.toFixed(2)),
          };
        },
      );

      // === Overall Percentage (average of module percentages) ===
      let overallPercentage = 0;
      if (moduleProgress.length > 0) {
        const sumPercentages = moduleProgress.reduce(
          (acc, mod) => acc + mod.percentage,
          0,
        );
        overallPercentage = sumPercentages / moduleProgress.length;
      }

      // === Completed Modules (where percentage == 100) ===
      const completedModules = moduleProgress.filter(
        (mod) => mod.percentage === 100,
      ).length;

      // === Completed Indicators (sum of indicators from completed modules) ===
      let completedIndicators = 0;
      moduleProgress.forEach((mod) => {
        if (mod.percentage === 100) {
          const moduleObj = clonedData.find((m) => m.name === mod.module_name);
          if (moduleObj) {
            completedIndicators += moduleObj.indicators?.length || 0;
          }
        }
      });

      // This ensures modules repeated across sites/quarters are only counted once.
      const moduleQuestionCount: Record<string, number> = {};

      allTasks.forEach((task) => {
        const moduleName = task.module_name || 'Unknown';
        const q = Number(task.question_count) || 0;

        if (moduleQuestionCount[moduleName] == null) {
          moduleQuestionCount[moduleName] = q;
        } else if (q > moduleQuestionCount[moduleName]) {
          moduleQuestionCount[moduleName] = q;
        }
      });

      const totalQuestions = Object.values(moduleQuestionCount).reduce(
        (sum, count) => sum + count,
        0,
      );

      // === Completed Questions (only modules that are 100% complete)
      let completedQuestions = 0;
      moduleProgress.forEach((mod) => {
        if (mod.percentage === 100) {
          completedQuestions += moduleQuestionCount[mod.module_name] || 0;
        }
      });

      // === Response ===
      return {
        success: true,
        message: 'Datacube and Standard validation successful',
        data: {
          datacube_id,
          standard_id,
          standard_name: standard.name,
          totalModules,
          completedModules,
          totalIndicators,
          completedIndicators,
          totalQuestions,
          completedQuestions,
          overallPercentage: Number(overallPercentage.toFixed(2)),
          moduleProgress,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error validating datacube and standard: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getTaskProgress(datacube_id: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // ✅ Validate datacube exists
      const datacube = await queryRunner.manager
        .getRepository(Datacube)
        .findOne({ where: { id: datacube_id }, select: ['id', 'status'] });

      if (!datacube) {
        throw new BadRequestException('Datacube not found');
      }

      // ✅ Query only the counts we need
      const taskRepo = queryRunner.manager.getRepository(DataCubeTask);

      const [totalTasks, completedTasks, submittedTasks] = await Promise.all([
        taskRepo.count({
          where: { datacube_frequency: { datacube: { id: datacube_id } } },
        }),
        taskRepo.count({
          where: {
            datacube_frequency: { datacube: { id: datacube_id } },
            status: 'COMPLETED',
          },
        }),
        taskRepo.count({
          where: {
            datacube_frequency: { datacube: { id: datacube_id } },
            status: 'SUBMITTED',
          },
        }),
      ]);

      // 🔹 Part 1: Datacube progress (max 50%)
      let datacubeProgress = 0;
      if (datacube.status !== DatacubeStatus.CREATED) {
        datacubeProgress += 25;
      }
      if (
        datacube.status === DatacubeStatus.DATA_COLLECTING ||
        datacube.status === DatacubeStatus.REPORT_GENERATED ||
        datacube.status === DatacubeStatus.COMPLETED
      ) {
        datacubeProgress += 25;
      }

      // 🔹 Part 2: Task progress (max 50%)
      const taskProgress =
        totalTasks > 0
          ? Number(((completedTasks / totalTasks) * 50).toFixed(2))
          : 0;

      const taskProgressPercentage = Number(
        (datacubeProgress + taskProgress).toFixed(2),
      );

      return {
        success: true,
        message: 'Task progress fetched successfully',
        data: {
          datacube_id,
          totalTasks,
          completedTasks,
          submittedTasks,
          taskProgressPercentage,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error fetching task progress: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getChartFilterResponse1(
    datacube_id: string,
    frequency_id: string,
    site_id: string,
    filters: any,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // ------------------------------
      // 1. Normalize "filters" input
      // ------------------------------
      const normalizeFilters = (f: any) => {
        if (!f) return [];
        if (typeof f === 'string') {
          try {
            const parsed = JSON.parse(f);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [{ filter_id: f }];
          }
        }
        if (Array.isArray(f)) return f;
        if (typeof f === 'object') return [f];
        return [];
      };

      const filterArray = normalizeFilters(filters);

      if (!filterArray.length) {
        return { success: true, data: [] };
      }

      // ------------------------------------
      // Helper: JSON-safe answer normalizer
      // ------------------------------------
      const normalizeAnswer = (value: any) => {
        if (value === null || value === undefined) return null;

        // If database "answer" column is JSONB,
        // and value is a string, wrap inside JSON string
        if (typeof value === 'string') return JSON.stringify(value);

        return value; // array or object is ok
      };

      // -----------------------------------------
      // 2. Process each filter independently
      // -----------------------------------------
      const filterResponses = await Promise.all(
        filterArray.map(async (raw) => {
          const filter =
            typeof raw === 'string' ? { filter_id: raw } : raw || {};

          const filterId = filter.filter_id || filter.filterId || filter.id;

          const optionId =
            filter.option_id || filter.optionId || filter.option || null;

          if (!filterId) {
            throw new BadRequestException(
              'filter_id is required for each filter',
            );
          }

          // -----------------------------------------
          // 3. Load filter entity
          // -----------------------------------------
          const filterEntity = await this.datasource
            .getRepository(WidgetFiltersEntity)
            .findOne({
              where: { id: filterId },
              relations: [
                'widget_item_id.combined_parameters.custom_parameter',
                'widget_item_id.widget',
                'widget_item_id.widget_type',
              ],
            });

          if (!filterEntity) {
            throw new BadRequestException(`Filter not found: ${filterId}`);
          }

          // If option not selected → return empty match
          if (!optionId) {
            return {
              filter_id: filterEntity.id,
              universal_question_id: filterEntity.universal_question_id,
              sequence: filterEntity.sequence,
              selected_option_id: null,
              filtered_task_ids: [],
              answer_map: {},
            };
          }

          // -----------------------------------------
          // 4. Build WHERE for TaskQuestionAnswer
          // -----------------------------------------

          // -----------------------------------------
          // 4. Build WHERE for TaskQuestionAnswer
          // -----------------------------------------
          // We need to filter by the specific answer option
          // -----------------------------------------
          // 5. Filter matching task answers
          // -----------------------------------------
          const jsonVal = JSON.stringify(optionId);
          const jsonArrVal = JSON.stringify([optionId]);

          let taskQuery = queryRunner.manager
            .getRepository(TaskQuestionAnswer)
            .createQueryBuilder('tqa')
            .innerJoin('tqa.task_question', 'tq')
            .innerJoin('tq.task', 'task')
            .innerJoin('task.datacube_frequency', 'df')
            .innerJoin('df.datacube', 'd')
            .leftJoin('task.site', 'site')
            .where('tqa.universal_question_id = :uqId', {
              uqId: filterEntity.universal_question_id,
            })
            .andWhere('d.id = :datacubeId', { datacubeId: datacube_id })
            .andWhere(
              new Brackets((qb) => {
                qb.where('tqa.answer::jsonb = :jsonVal::jsonb', {
                  jsonVal,
                }).orWhere('tqa.answer::jsonb @> :jsonArrVal::jsonb', {
                  jsonArrVal,
                });
              }),
            );

          if (frequency_id !== 'all') {
            taskQuery = taskQuery.andWhere('df.id = :freqId', {
              freqId: frequency_id,
            });
          }
          if (site_id !== 'all') {
            taskQuery = taskQuery.andWhere('site.id = :siteId', {
              siteId: site_id,
            });
          }

          taskQuery.select('task.id', 'task_id');

          const rawResults = await taskQuery.getRawMany();
          const matchedTaskIds = rawResults
            .map((r) => r.task_id)
            .filter(Boolean);

          const uniqueTaskIds = [...new Set(matchedTaskIds)];

          // -----------------------------------------
          // 6. Get answers for matched tasks
          // -----------------------------------------
          let filteredAnswers: any[] = [];

          if (uniqueTaskIds.length) {
            filteredAnswers = await queryRunner.manager
              .getRepository(TaskQuestionAnswer)
              .find({
                where: {
                  task_question: {
                    task: {
                      id: In(uniqueTaskIds),
                    },
                  },
                },
              });
          }

          // -----------------------------------------
          // 7. Build answer map
          // -----------------------------------------
          const answerMap = new Map<string, string[]>();

          filteredAnswers.forEach((ans) => {
            const uq = ans.universal_question_id;
            const ansVal = ans.answer;

            if (!answerMap.has(uq)) answerMap.set(uq, []);

            if (!ansVal) return;

            if (Array.isArray(ansVal)) {
              ansVal.forEach((v) => answerMap.get(uq)!.push(v));
            } else {
              answerMap.get(uq)!.push(ansVal);
            }
          });

          // -----------------------------------------
          // 8. Final response for each filter
          // -----------------------------------------
          return {
            filter_id: filterEntity.id,
            universal_question_id: filterEntity.universal_question_id,
            sequence: filterEntity.sequence,
            selected_option_id: optionId,
            filtered_task_ids: matchedTaskIds,
            // answer_map: Object.fromEntries(answerMap), // Removed as per request

            combinedParams: (() => {
              // 1. Build currentMap for macro evaluation (summing numeric values)
              const currentMap = new Map<any, any>();
              for (const [key, values] of answerMap.entries()) {
                const sum = values.reduce((acc, val) => {
                  let v = String(val);
                  if (v.includes(',')) {
                    v = v.split(',')[0];
                  } else if (v.includes(' ')) {
                    v = v.split(' ')[0];
                  }
                  const num = parseFloat(v);
                  return acc + (isNaN(num) ? 0 : num);
                }, 0);
                currentMap.set(key, { consolidated_response: sum });
              }

              // 2. Iterate and evaluate parameters
              const results: any[] = [];
              const combinedList =
                filterEntity.widget_item_id?.combined_parameters || [];

              for (const cp of combinedList) {
                const customList = cp.custom_parameter || [];
                for (const custom of customList) {
                  // Evaluate
                  let calculatedValue: string | number = 0;
                  try {
                    calculatedValue = this.evaluateMacroExpression(
                      custom.macro_function,
                      custom.questions ||
                        custom.universal_questions ||
                        (custom.macro_function || '').match(/UID_\d+/g) ||
                        [],
                      currentMap,
                      null,
                      null,
                    );
                  } catch (e) {
                    calculatedValue = 0;
                  }

                  results.push({
                    custom_parameter_id: custom.id,
                    widget_id: filterEntity.widget_item_id?.widget?.id,
                    widget_type:
                      filterEntity.widget_item_id?.widget_type?.type || 'chart',
                    macro_function: custom.macro_function,
                    calculated_value: String(calculatedValue),
                  });
                }
              }
              return results;
            })(),
          };
        }),
      );

      return { success: true, data: filterResponses };
    } catch (err) {
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getAllDatacubeQuestions() {
    try {
      // const questions = await this.connection.manager.getRepository(DataCubeQuestion).find({
      //   where: { is_deleted: false },
      //   select: ['title', 'universal_question_id'],
      // });
      const questions = await this.connection.manager
        .getRepository(DataCubeQuestion)
        .createQueryBuilder('q')
        .select([
          'q.universal_question_id AS universal_question_id',
          'q.title AS title',
        ])
        .where('q.is_deleted = :isDeleted', { isDeleted: false })
        .distinctOn(['q.universal_question_id']) // <-- UNIQUE
        .orderBy('q.universal_question_id') // PostgreSQL requires ORDER BY
        .getRawMany();
      return {
        success: true,
        data: questions, // Return the unique universal_question_ids
      };
    } catch (error) {
      throw new BadRequestException(error.message); // Handle any errors
    }
  }
}
