import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as excelToJson from 'convert-excel-to-json';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { groupBy } from 'lodash';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import * as CONFIG from 'src/config.json';

export function camelize(str: string) {
  return str
    .replace(
      /(?:^\w|[A-Z]|\b\w)/g,
      function capitalizeFirstLetter(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      },
    )
    .replace(/\s+/g, '');
}

export const alphanumaric = /^[A-Z0-9][A-Z0-9]*$/;

export const tokenGenerator = (): string => {
  return randomBytes(20).toString('hex');
};

export const getTenantRoles = () => {
  return ['ADMIN'];
};

export const get_admin_roles = () => {
  return CONFIG.ADMIN_ROLE.map((data) => {
    return { name: data };
  });
};

export enum TenentFeatures {
  READ = 'READ',
  WRITE = 'WRITE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  INVITE = 'INVITE',
  RESEND_INVITE = 'RESEND_INVITE',
  BLOCK_UNBLOCK = 'BLOCK/UNBLOCK',
  APPROVE_REJECT = 'APPROVE/REJECT',
  REASSIGN = 'REASSIGN',
  CONFIG = 'CONFIG',
  CHANGE_PLAN = 'CHANGE_PLAN',
  ROLES = 'ROLES',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  COMPANY_PROFILE = 'COMPANY_PROFILE',
  EMISSIONS_DATABASE = 'EMISSIONS_DATABASE',
  HOME = 'HOME',
  TASKS = 'TASKS',
  USERS = 'USERS',
  DATA_CUBES = 'DATA_CUBES',
  REPORTS = 'REPORTS',
  INSIGHTS = 'INSIGHTS',
  LANDING_PAGE = 'LANDING_PAGE',
  DISCLOSURE = 'DISCLOSURE',
}

export enum AdminFeatures {
  READ = 'READ',
  WRITE = 'WRITE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CREATE = 'CREATE',
  INVITE = 'INVITE',
  BLOCK = 'BLOCK',
  UNBLOCK = 'UNBLOCK',
  ROLES = 'ROLES',
  EMISSIONS_DATABASE = 'EMISSIONS_DATABASE',
}

export const AdminModules = [
  'GUEST',
  'ADMIN',
  'SUSTAINABILITY_MANAGER',
  'DATA_REVIEWER',
  'DATA_PROVIDER',
];

export const TENENT_ROLE = [
  'GUEST',
  'ADMIN',
  'SUSTAINABILITY_MANAGER',
  'DATA_REVIEWER',
  'DATA_PROVIDER',
];

export const TenentModules = [
  'USER',
  'DATA_CUBE',
  'TASK',
  'REPORT',
  'INSIGHTS',
  'DISCLOSURE',
  'LANDING_PAGE',
  'ORGANIZATION',
  'BUSINESS_UNIT',
  'GENERAL_INFO',
  'SETTINGS',
  'HEADER',
  'EMISSIONS_DATABASE',
];

export enum ActivityType {
  DATA_CUBE_CREATED = 'DATA_CUBE_CREATED',
  DATA_CUBE_UPDATED = 'DATA_CUBE_UPDATED',
  DATA_CUBE_DELETED = 'DATA_CUBE_DELETED',
  DATA_CUBE_COMPLETED = 'DATA_CUBE_COMPLETED',
  DATA_CUBE_CONFIGURED = 'DATA_CUBE_CONFIGURED',
  DATA_CUBE_FREQUENCY_COMPLETED = 'DATA_CUBE_FREQUENCY_COMPLETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_IN_PROGRESS = 'TASK_IN_PROGRESS',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_REVIEWING = 'TASK_REVIEWING',
  TASK_REASSIGNED = 'TASK_REASSIGNED',
  TASK_REJECTED = 'TASK_REJECTED',
  REPORT_CREATED = 'REPORT_CREATED',
  REPORT_UPDATED = 'REPORT_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_INPROGRESS = 'TASK_INPROGRESS',
  TASK_SUBMITTED = 'TASK_SUBMITTED',
  TASK_COMMENTED = 'TASK_COMMENTED',
  TASK_RESPONSE_UPLOADED = 'TASK_RESPONSE_UPLOADED',
  TASK_EXCEL_GENERATED = 'TASK_EXCEL_GENERATED',
}

export const default_roles_tenent_admin = () => {
  const roles_list = [];

  AdminModules.forEach((value) => {
    roles_list.push({
      role: { name: 'SUPERADMIN' },
      features: Object.keys(AdminFeatures).filter((v) => isNaN(Number(v))),
      module: value,
    });
  });
  return roles_list;
};

export const default_tenent_role_access = () => {
  const role_access = [];
  get_tenent_roles().forEach((role) => {
    Object.keys(default_tenent_roles[role.name]).forEach((modules) => {
      role_access.push({
        role: { name: role.name },
        module: modules,
        features: Array.isArray(default_tenent_roles[role.name][modules])
          ? default_tenent_roles[role.name][modules]
          : [default_tenent_roles[role.name][modules]],
      });
    });
  });
  return role_access;
};

export const get_tenent_roles = () => {
  return CONFIG.TENENT_ROLES.map((data) => {
    return { name: data };
  });
};

export const default_tenent_roles = {
  GUEST: CONFIG.TENENT_FEATURES,
  ADMIN: CONFIG.TENENT_FEATURES,
  SUSTAINABILITY_MANAGER: CONFIG.TENENT_FEATURES,
  DATA_REVIEWER: CONFIG.TENENT_FEATURES,
  DATA_PROVIDER: CONFIG.TENENT_FEATURES,
};

export const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/;

export const comparePassword = async (
  userPassword: string,
  currentPassword: string,
) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  bcrypt.compare(currentPassword, userPassword);

// export const comparePassword = async (
//   userPassword: string,
//   currentPassword: string,
// ): Promise<boolean> => {
//   return (await bcrypt.compare(currentPassword, userPassword)) as boolean;
// };
export const QUERY_PARAMS = (params: {
  page?: number;
  limit?: number;
  sort?: string;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  [key: string]: unknown;
}) => {
  const { limit, page, sort } = params;
  const filter: {
    [key: string]: unknown;
  } = {};

  Object.keys(params).forEach((item) => {
    if (!['limit', 'page', 'sort'].includes(item)) {
      filter[item] = params[item];
    }
  });

  const sortList: string[] = sort.split('-');
  const sorting: {
    [key: string]: unknown;
  } = {};
  if (sortList.length === 2) {
    sorting[sort.replace('-', '')] = -1;
  } else {
    sorting[sort.replace('-', '')] = 1;
  }
  return {
    skip: (page - 1 || 0) * limit,
    limit,
    sort: sorting,
    page,
    filter,
  };
};

export const multerOptionsImage = {
  // Enable file size limits
  limits: {
    fileSize: 100 * 1000 * 1000,
  },
  // Check the mimetypes to allow for upload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileFilter: (req: any, file: any, cb: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Unsupported file type ${file.originalname}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
};

export const multerOptionsAllKindFile = {
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    cb(null, true);
  },
  storage: memoryStorage(),
};

export const multerOptionsFile = {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (
      extname(file.originalname) === '.xls' ||
      extname(file.originalname) === '.xlsx'
    ) {
      // Allow storage of file

      cb(null, true);
    } else {
      // Reject file

      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },

  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = 'public';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
  }),
};

export const multerOptionsTaskFile = {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Define allowed file types
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
    ];

    // Check if file type is allowed
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          `Unsupported file type: ${file.mimetype}. Allowed types are: PDF, Word, Excel, Text, CSV, Images (JPEG, PNG, GIF), and compressed files (ZIP, RAR)`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  storage: memoryStorage(),
};

export const validateExcelData = (path) => {
  const excelData = excelToJson({
    sourceFile: path,
    sheets: [
      {
        // Excel Sheet Name
        name: 'Sheet1',
        range: 'A1:D1',
        // Header Row -> be skipped and will not be present at our result object.

        // Mapping columns to keys
        Sheet1: [
          {
            A1: 'A1',
          },
        ],
      },
    ],
  });
  if (excelData.Sheet1.length === 0) {
    return false;
  }
  const res = excelData.Sheet1[0];
  if (
    res.A === 'industry_name' &&
    res.B === 'description' &&
    res.C === 'is_active' &&
    res.D === 'is_deleted'
  ) {
    return true;
  }
  return false;
};
export const getStatusValue = (value: any, key: string) => {
  if (value.is_deleted || value?.is_deleted) {
    return 'INACTIVE';
  }
  if (value.is_active === false) {
    return 'INACTIVE';
  }
  if (key === 'sector' && value.industry?.length === 0) {
    return 'PENDING';
  }
  if (key === 'industry' && !value.sector) {
    return 'PENDING';
  }
  if (key === 'standard' && value?.module?.length === 0) {
    return 'PENDING';
  }
  if (key === 'module' && value?.indicator?.length === 0) {
    return 'PENDING';
  }
  if (key === 'indicator' && value?.question?.length === 0) {
    return 'PENDING';
  }
  return 'ACTIVE';
};

export const consolidatedGrouping = (
  standardModules,
  standard_ids,
): Promise<any[]> => {
  const grouped = groupBy(standardModules, (sm: any) => sm.master_module.id);

  const commonModules: any = Object.values(grouped).map((moduleGroup: any) => {
    const mergedIndicators = {};

    for (const mod of moduleGroup) {
      for (const ind of mod.standard_indicators) {
        const indicatorKey = ind.master_indicator.id;

        if (!mergedIndicators[indicatorKey]) {
          mergedIndicators[indicatorKey] = {
            id: ind.master_indicator.id,
            name: ind.master_indicator.name,
            standard_question: new Map(),
            question_sequence: new Map(),
          };
        }

        for (const qs of ind.question_sequences) {
          // CRITICAL: Use the sequence ID as key to prevent overwriting different sequences
          // Multiple groups will have different sequence IDs
          const sequenceKey = qs.id;

          // --- 1️⃣ Add question_sequence (MUST NOT deduplicate sequences with different groups) ---
          mergedIndicators[indicatorKey].question_sequence.set(sequenceKey, qs);

          // --- 2️⃣ Add standard_question (can deduplicate based on question content) ---
          const stdQ = qs.standard_question_id;
          if (stdQ) {
            const subId =
              stdQ?.sub_indicator_id?.id || stdQ?.sub_indicator_id || 'none';
            const indId = stdQ?.indicator_id || ind.master_indicator.id;
            const uqid =
              stdQ?.master_question?.universal_question_id || stdQ?.id;
            const title = stdQ?.title || '';
            const questionKey = `${uqid}_${indId}_${subId}_${title}`;

            mergedIndicators[indicatorKey].standard_question.set(
              questionKey,
              stdQ,
            );
          }

          // --- 3️⃣ Handle group question sequences ---
          if (qs.group_questions) {
            for (const gqs of qs.group_questions.group_question_sequences) {
              if (gqs.standard_question) {
                const gSubId =
                  gqs.standard_question?.sub_indicator_id?.id ||
                  gqs.standard_question?.sub_indicator_id ||
                  'none';
                const gIndId =
                  gqs.standard_question?.indicator_id ||
                  ind.master_indicator.id;
                const gTitle = gqs.standard_question?.title || '';
                const gUid =
                  gqs.standard_question?.master_question
                    ?.universal_question_id || gqs.standard_question?.id;
                const groupKey = `${gUid}_${gIndId}_${gSubId}_${gTitle}`;

                mergedIndicators[indicatorKey].standard_question.set(
                  groupKey,
                  gqs.standard_question,
                );
              }
            }
          }
        }
      }
    }

    // Return merged module
    return {
      id: moduleGroup[0].master_module.id,
      name: moduleGroup[0].master_module.name,
      indicators: Object.values(mergedIndicators).map((ind: any) => ({
        id: ind.id,
        name: ind.name,
        standard_question: Array.from(ind.standard_question.values()),
        question_sequence: Array.from(ind.question_sequence.values()),
      })),
    };
  });

  return commonModules;
};

export const JOIN_RELATIONS = [
  {
    alias: 'standard',
    path: 'sm.standard',
    type: 'innerJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'master_module',
    path: 'sm.master_module',
    type: 'innerJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'si',
    path: 'sm.standard_indicators',
    type: 'innerJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'master_indicator',
    path: 'si.master_indicator',
    type: 'innerJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'qs',
    path: 'si.question_sequences',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'standard_question',
    path: 'qs.standard_question_id',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'mixed_type_questions',
    path: 'standard_question.mixed_questions',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'standard_question_options',
    path: 'standard_question.standard_question_options',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'standard_sub_indicators',
    path: 'standard_question.sub_indicator_id',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'department',
    path: 'standard_question.department',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'group_questions',
    path: 'qs.group_questions',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'gqs',
    path: 'group_questions.group_question_sequences',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'group_question_question',
    path: 'gqs.standard_question',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'group_question_sub_indicators',
    path: 'group_question_question.sub_indicator_id',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'group_question_department',
    path: 'group_question_question.department',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'group_question_options',
    path: 'group_question_question.standard_question_options',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'group_question_mixed_questions',
    path: 'group_question_question.mixed_questions',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'question_rules',
    path: 'qs.question_rules',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'parent_question',
    path: 'question_rules.parent_question_id',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'parent_option',
    path: 'question_rules.parent_option_id',
    type: 'leftJoinAndSelect',
    is_deleted: false,
  },
];

export const MODULE_CONSOLIDATED_JOIN_RELATIONS = [
  {
    alias: 'standard',
    path: 'sm.standard',
    type: 'innerJoinAndSelect',
    is_deleted: false,
  },
  {
    alias: 'master_module',
    path: 'sm.master_module',
    type: 'innerJoinAndSelect',
    is_deleted: false,
  },
  // {
  //   alias: 'si',
  //   path: 'sm.standard_indicators',
  //   type: 'innerJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'master_indicator',
  //   path: 'si.master_indicator',
  //   type: 'innerJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'qs',
  //   path: 'si.question_sequences',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'standard_question',
  //   path: 'qs.standard_question_id',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'mixed_type_questions',
  //   path: 'standard_question.mixed_questions',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'standard_question_options',
  //   path: 'standard_question.standard_question_options',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'standard_sub_indicators',
  //   path: 'standard_question.sub_indicator_id',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'department',
  //   path: 'standard_question.department',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'group_questions',
  //   path: 'qs.group_questions',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'gqs',
  //   path: 'group_questions.group_question_sequences',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'group_question_question',
  //   path: 'gqs.standard_question',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'group_question_options',
  //   path: 'group_question_question.standard_question_options',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'group_question_mixed_questions',
  //   path: 'group_question_question.mixed_questions',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'question_rules',
  //   path: 'qs.question_rules',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'parent_question',
  //   path: 'question_rules.parent_question_id',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
  // {
  //   alias: 'parent_option',
  //   path: 'question_rules.parent_option_id',
  //   type: 'leftJoinAndSelect',
  //   is_deleted: false,
  // },
];
