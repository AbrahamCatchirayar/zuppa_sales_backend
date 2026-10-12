import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import { FileService } from 'src/file-storage/file-storage.service';
import { MailServiceRq } from 'src/mail/mail.service';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { IUser } from 'src/modules/user.decorator';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { ActivityType } from 'src/utils';
import { AwsS3Config } from '../../../../file-storage/aws.config';
import { ConsolidatedResponseService } from '../../consolidated/consolidated_response.service';
import { User } from '../../user/entities/user.entity';
import { QUESTIONS_RELATIONS } from '../constants/question.constants';
import { TASK_RELATIONS } from '../constants/task.constant';
import { Datacube, DatacubeStatus } from '../datacube.entity';
import {
  DataCubeFrequency,
  DataCubeFrequencyStatus,
} from '../datacube_frequency.entity';
import { DataCubeGroupQuestionsRule } from '../questions/group_questions/group_question.entity';
import { DataCubeGroupQuestions } from '../questions/group_questions/group_question_sequence.entity';
import { DataCubeQuestion } from '../questions/question.entity';
import { DataCubeQuestionOption } from '../questions/question_options/question_option.entity';
import { DataCubeQuestionSequences } from '../questions/question_sequences/question_sequence.entity';
import {
  ApproveTaskDto,
  BulkReassignTaskDto,
  BulkUploadDto,
  CreateDataCubeTaskDto,
  DeleteGroupQuestionDto,
  GroupQuestionDto,
  ReassignTaskDto,
  ResponseDto,
  ReviewTaskQuestionDto,
  TaskCommentsDto,
  UpdateTaskResponseDto,
} from './task.dto';
import { DataCubeTask, TaskStatus } from './task.entity';
import { TaskComments } from './task_comments.entity';
import { TaskQuestionAnswer } from './task_question_answer.entity';
import { TaskQuestion } from './task_questions.entity';
import { DataCubeMixedTypeQuestion } from '../questions/mixed_questions/mixed_question.entity';
import { TenantActivityService } from '../../activitylog/tenantactivity.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(DataCubeTask)
    private readonly dataCubeTaskModel: Repository<DataCubeTask>,
    @InjectRepository(TaskQuestion)
    private readonly taskQuestionModel: Repository<TaskQuestion>,
    @Inject(CONNECTION)
    private readonly connection: DataSource,
    private readonly fileService: FileService,
    private readonly activityService: TenantActivityService,
    private readonly mailService: MailServiceRq,
    @Inject(forwardRef(() => ConsolidatedResponseService))
    private readonly consolidatedResponseService: ConsolidatedResponseService,
    private readonly awsS3Config: AwsS3Config,
  ) {
    this.dataCubeTaskModel = connection.getRepository(DataCubeTask);
    this.taskQuestionModel = connection.getRepository(TaskQuestion);
  }

  // private readonly TASK_RELATIONS = [
  //   'datacube_frequency',
  //   'site',
  //   'task_questions'
  // ] as const;

  private buildTaskQuery(user: IUser) {
    const baseQuery = {
      relations: TASK_RELATIONS.map((relation) => relation.path),
    };

    const roleQueries = {
      DATA_PROVIDER: {
        ...baseQuery,
        where: {
          datacube_frequency: {
            datacube: {
              status: In([
                DatacubeStatus.SETUP,
                DatacubeStatus.DATA_COLLECTING,
              ]),
            },
          },
          data_provider: { id: user.id },
          status: In([
            TaskStatus.IN_PROGRESS,
            TaskStatus.REASSIGNED,
            TaskStatus.CREATED,
            TaskStatus.REJECTED,
            TaskStatus.COMPLETED,
          ]),
        },
      },
      DATA_REVIEWER: {
        ...baseQuery,
        where: {
          datacube_frequency: {
            datacube: {
              status: In([
                DatacubeStatus.SETUP,
                DatacubeStatus.DATA_COLLECTING,
              ]),
            },
          },
          data_reviewer: { id: user.id },
          status: In([
            TaskStatus.SUBMITTED,
            TaskStatus.REVIEWING,
            TaskStatus.COMPLETED,
          ]),
        },
      },
      DEFAULT: baseQuery,
    };

    return roleQueries[user.role] || roleQueries.DEFAULT;
  }

  async getAllTasks(param: any) {
    const { page, limit, skip, sort, filter } = param;
    const { otherFilter, is_deleted, search } = filter;
    const whereConditions: any = {
      ...otherFilter,
      is_deleted: is_deleted !== undefined ? is_deleted : false,
    };
    const query = {
      take: limit,
      skip,
      order: sort,
      where: whereConditions,
      relations: TASK_RELATIONS.map((relation) => relation.path),
    };

    if (search) {
      query.where = [
        {
          ...whereConditions,
          task_questions: {
            question_sequence: {
              public_module_name: ILike(`%${search}%`),
            },
          },
        },
      ];
    }

    const [data, totalcount] = await this.dataCubeTaskModel.findAndCount(query);
    return {
      success: true,
      task: data,
      meta: {
        currentCount: data.length,
        currentPage: page,
        currentLimit: limit,
        totalcount,
      },
    };
  }

  async generateTaskAnswerWorkbooks2(
    siteId: string,
    moduleId: string,
    datacubeIds: string[],
  ) {
    const activeDatacubes = await this.connection.getRepository(Datacube).find({
      where: {
        is_deleted: false,
        // status: 'CREATED',
        id: In(datacubeIds),
      },
      select: ['id', 'name'],
      // async generateTaskAnswerTemplate(siteId: string, moduleId: string) {
      // 1️⃣ Fetch all active datacubes
      // const activeDatacubes = await this.connection.getRepository(Datacube).find({
      // where: { is_deleted: false }, // adjust field if different
    });

    const groupedByDatacube: Record<string, any> = {};
    const uniqueTaskIdsByDatacube: Record<string, string[]> = {};

    for (const datacube of activeDatacubes) {
      // 1️⃣ Get all active frequencies for this datacube
      const frequencies = await this.connection
        .getRepository(DataCubeFrequency)
        .find({
          where: {
            is_deleted: false,
            datacube: { id: datacube.id },
          },
          select: ['id', 'frequency_name'],
          order: { id: 'ASC' },
        });

      if (frequencies.length === 0) continue;

      // 2️⃣ Get first frequency
      const firstFrequency = frequencies[0];
      const datacubeTaskIds = new Set<string>();

      // ✅ NEW: Collect task IDs from ALL frequencies
      for (const freq of frequencies) {
        const tasksForFreq = await this.connection
          .getRepository(TaskQuestion)
          .find({
            where: {
              is_deleted: false,
              site: siteId,
              datacube_frequency: freq.id,
              question_sequence: { public_module_id: moduleId },
            },
            select: ['id'],
            relations: ['task'],
          });

        for (const tq of tasksForFreq) {
          if (tq.task?.id) {
            datacubeTaskIds.add(tq.task.id);
          }
        }
      }

      // 3️⃣ Fetch questions for the first frequency only (for template structure)
      const taskQuestions = await this.connection
        .getRepository(TaskQuestion)
        .find({
          where: {
            is_deleted: false,
            site: siteId,
            datacube_frequency: firstFrequency.id,
            question_sequence: { public_module_id: moduleId },
          },
          select: ['id', 'universal_question_id'],
          relations: [
            'question_sequence',
            'question_sequence.group_question_rule',
            'question_sequence.datacube_question.mixed_questions',
            'question_sequence.datacube_question',
            'task',
          ],
        });

      if (!taskQuestions || taskQuestions.length === 0) {
        continue; // <---- skip to next datacube
      }

      // Patch to correct universal_question_id values
      for (const q of taskQuestions) {
        // If TypeORM overwrote it with 0 or undefined
        if (!q.universal_question_id || q.universal_question_id === '0') {
          // Try to restore from the related question_sequence if available
          if (q.question_sequence?.universal_question_id) {
            q.universal_question_id = q.question_sequence.universal_question_id;
          }
        }
      }

      const mappedQuestions: any[] = [];

      for (const q of taskQuestions) {
        const taskId = q.task?.id;
        if (taskId) datacubeTaskIds.add(taskId);

        // ✅ CASE 1: It is a group placeholder (universal_question_id = 0)
        if (q.universal_question_id === '0') {
          const groupRuleId = q.question_sequence?.group_question_rule?.id;
          if (!groupRuleId) continue;

          // 🔥 Fetch group question members
          const groupQuestions = await this.connection
            .getRepository(DataCubeGroupQuestions)
            .find({
              where: { group_question_rule: { id: groupRuleId } },
              relations: ['datacube_question'],
              order: { group_sequence: 'ASC' },
            });

          for (const gq of groupQuestions) {
            let groupTitle = gq.datacube_question?.title;

            if (gq.datacube_question?.question_type == 'MIXED_TYPE') {
              const mixedUnits = await this.connection
                .getRepository(DataCubeMixedTypeQuestion)
                .findOne({
                  where: { question: { id: gq.datacube_question.id } },
                  select: ['id', 'unit_enum', 'unit_name'],
                });

              if (mixedUnits?.unit_enum?.length) {
                groupTitle += ` (${mixedUnits.unit_enum.join(', ')})`;
              } else if (mixedUnits?.unit_name) {
                groupTitle += ` (${mixedUnits.unit_name})`;
              }
            }

            mappedQuestions.push({
              universal_question_id: gq.universal_question_id,
              site: q.site,
              is_group: true,
              datacube_frequency: q.datacube_frequency,
              question_sequence: {
                is_dependent: gq.is_dependent,
                task_id: taskId,
                question_order: q.question_sequence.sequence,
                questable_type: gq.datacube_question.question_type,
                public_indicator_id: q.question_sequence?.public_indicator_id,
                public_indicator_name:
                  q.question_sequence?.public_indicator_name,
                public_module_id: q.question_sequence?.public_module_id,
                public_module_name: q.question_sequence?.public_module_name,
                universal_question_id: gq.universal_question_id,
                group_name: q.question_sequence.group_question_rule.name,
                group_maxlimit:
                  q.question_sequence.group_question_rule.max_limit,
                datacube_question: {
                  id: gq.datacube_question?.id,
                  title: groupTitle,
                  question_type: gq.datacube_question?.question_type,
                  sub_indicator_id: gq.datacube_question?.sub_indicator_id,
                  sub_indicator_name: gq.datacube_question?.sub_indicator_name,
                },
              },
              module_name: q.question_sequence?.public_module_name,
              indicator_name: q.question_sequence?.public_indicator_name,
            });
          }
          continue;
        }

        let title = q.question_sequence?.datacube_question?.title;

        if (
          q.question_sequence?.datacube_question?.question_type === 'MIXED_TYPE'
        ) {
          const dcQuestID = q.question_sequence.datacube_question.id;
          const mixedUnits = await this.connection
            .getRepository(DataCubeMixedTypeQuestion)
            .findOne({
              where: { question: { id: dcQuestID } },
              select: ['id', 'unit_enum', 'unit_name'],
            });

          if (mixedUnits?.unit_enum?.length) {
            title += ` (${mixedUnits.unit_enum.join(', ')})`;
          } else if (mixedUnits?.unit_name) {
            title += ` (${mixedUnits.unit_name})`;
          }
        }

        // ✅ CASE 2: Normal question
        mappedQuestions.push({
          universal_question_id: q.universal_question_id,
          site: q.site,
          is_group: false,
          datacube_frequency: q.datacube_frequency,
          question_sequence: {
            is_dependent: q.question_sequence?.is_dependent,
            task_id: taskId,
            question_order: q.question_sequence.sequence,
            questable_type: q.question_sequence?.questable_type,
            public_indicator_id: q.question_sequence?.public_indicator_id,
            public_indicator_name: q.question_sequence?.public_indicator_name,
            public_module_id: q.question_sequence?.public_module_id,
            public_module_name: q.question_sequence?.public_module_name,
            universal_question_id: q.question_sequence?.universal_question_id,
            datacube_question: {
              id: q.question_sequence?.datacube_question?.id,
              // title: q.question_sequence?.datacube_question?.title,
              title,
              question_type:
                q.question_sequence?.datacube_question?.question_type,
              sub_indicator_id:
                q.question_sequence?.datacube_question?.sub_indicator_id,
              sub_indicator_name:
                q.question_sequence?.datacube_question?.sub_indicator_name,
            },
          },
          module_name: q.question_sequence?.public_module_name,
          indicator_name: q.question_sequence?.public_indicator_name,
        });
      }

      // 4.1️⃣ Group by indicator first
      const groupedByIndicator: Record<string, any[]> = {};

      for (const q of mappedQuestions) {
        const indicator = q.indicator_name || 'UNKNOWN';
        if (!groupedByIndicator[indicator]) {
          groupedByIndicator[indicator] = [];
        }
        groupedByIndicator[indicator].push(q);
      }

      // 4.2️⃣ Sort inside each indicator group using question_order
      for (const indicator in groupedByIndicator) {
        groupedByIndicator[indicator].sort((a, b) => {
          const orderA = a.question_sequence?.question_order ?? 9999;
          const orderB = b.question_sequence?.question_order ?? 9999;
          return orderA - orderB;
        });
      }

      // 4.3️⃣ Flatten back to single ordered list in indicator order
      const orderedQuestions = Object.keys(groupedByIndicator)
        .sort() // alphabetical indicator ordering - adjust if needed
        .flatMap((indicator) => groupedByIndicator[indicator]);

      // 5️⃣ Prepare the frequency list for return
      const frequencyList = frequencies.map((f) => ({
        id: f.id,
        frequency_name: f.frequency_name,
      }));

      // 6️⃣ Build final grouped structure
      groupedByDatacube[datacube.id] = {
        datacube_name: datacube.name,
        questions: orderedQuestions,
        listoffrequncies: frequencyList,
      };

      uniqueTaskIdsByDatacube[datacube.id] = Array.from(datacubeTaskIds);
    }

    // 7️⃣ Return final response
    return {
      success: true,
      groupedByDatacube,
      unique_task_ids_by_datacube: uniqueTaskIdsByDatacube,
    };
  }

  async generateTaskAnswerWorkbooks(
    siteId: string,
    moduleId: string,
    datacubeIds: string[],
    user: User,
  ) {
    const { groupedByDatacube, unique_task_ids_by_datacube } =
      await this.generateTaskAnswerWorkbooks2(siteId, moduleId, datacubeIds);

    const workbookPaths: string[] = [];

    const datacubeResults: {
      datacubeId: string;
      datacubeSheetLink: string | null;
      datacubeFreqSheetLink: string | null;
    }[] = [];

    const firstFrequencySheetLink = '';
    const sanitize = (s: string) =>
      String(s || '')
        .replace(/[^a-zA-Z0-9-_\s]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 60);

    const baseDir = path.join(process.cwd(), 'excel');
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    for (const [datacubeId, datacubeDataUnknown] of Object.entries(
      groupedByDatacube,
    )) {
      let datacubeFreqSheetLink = null;
      let datacubeSheetLink = null;

      const taskIdsForDatacube = unique_task_ids_by_datacube[datacubeId] || [];

      const datacubeData = datacubeDataUnknown;
      const datacubeName = sanitize(datacubeData.datacube_name) || 'Datacube';
      const firstModuleName = sanitize(
        datacubeData.questions?.[0]?.module_name || 'Module',
      );
      const targetDir = path.join(baseDir, datacubeName, firstModuleName);
      if (!fs.existsSync(targetDir))
        fs.mkdirSync(targetDir, { recursive: true });

      if (!datacubeSheetLink) {
        // -------------------
        // Per-frequency workbook
        // -------------------
        const perFreqWorkbook = new ExcelJS.Workbook();
        let masterQuestionOrder: string[] = [];
        // Cache option VALUES, not formulas, so we can write them to every sheet
        const dropdownOptionsCache = new Map<string, string[]>();

        const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
        const bankingYearMonthOrder: Record<string, number> = {
          APRIL: 1,
          MAY: 2,
          JUNE: 3,
          JULY: 4,
          AUGUST: 5,
          SEPTEMBER: 6,
          OCTOBER: 7,
          NOVEMBER: 8,
          DECEMBER: 9,
          JANUARY: 10,
          FEBRUARY: 11,
          MARCH: 12,
        };

        const allQuestions = datacubeData.questions || [];

        for (const [freqId, freqData] of Object.entries(
          datacubeData.listoffrequncies as Record<
            string,
            { id: string; frequency_name: string }
          >,
        )) {
          const freqObj = await this.connection
            .getRepository(DataCubeFrequency)
            .findOne({
              where: { id: freqData.id },
              select: ['id', 'frequency_name'],
            });

          const frequencyName = sanitize(
            freqObj?.frequency_name || 'Frequency',
          );
          const safeSheetName = frequencyName.slice(0, 31);
          const questions = [...allQuestions];

          if (masterQuestionOrder.length === 0) {
            masterQuestionOrder = questions.map((q) => q.universal_question_id);
          }

          const sheet = perFreqWorkbook.addWorksheet(safeSheetName);
          let dropdownColIndex = 50; // Start hidden dropdowns at column 50 (AX)
          const moduleName = sanitize(questions[0]?.module_name || 'Module');

          // Initialize deferred writes array
          const deferredWrites: { row: number; col: number; value: string }[] =
            [];

          // Columns
          sheet.columns = [
            { header: 'Indicator', key: 'indicator', width: 30 },
            { header: 'Sub-Indicator', key: 'subIndicator', width: 30 },
            { header: 'UID', key: 'questionUid', width: 10 },
            { header: 'Question Type', key: 'questionType', width: 15 },
            { header: 'Group Name', key: 'groupName', width: 20 }, // ✅ NEW COLUMN
            {
              header: 'Task Question Title',
              key: 'taskQuestionTitle',
              width: 80,
            },
            { header: 'Answer', key: 'answer', width: 30 },
          ];

          // Top info row
          sheet.mergeCells('A1:G1');
          const topCell = sheet.getCell('A1');
          topCell.value = `Datacube: ${datacubeName} | Frequency: ${frequencyName} | Module: ${moduleName}`;
          topCell.alignment = { horizontal: 'center', vertical: 'middle' };
          topCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFBEE4F9' },
          };
          sheet.getRow(1).height = 24;

          // Header row
          const headerRow = sheet.addRow([
            'Indicator',
            'Sub-Indicator',
            'UID',
            'Question Type',
            'Group Name', // ✅ New Column
            'Task Question Title',
            'Answer',
          ]);

          headerRow.font = { bold: true };
          headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
          headerRow.height = 20;
          headerRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCCCCC' },
            };
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            };
            cell.alignment = { wrapText: true, vertical: 'top' };
          });

          // Data rows
          for (const q of questions) {
            if (
              !q.universal_question_id ||
              q.universal_question_id === 0 ||
              q.universal_question_id === '0'
            ) {
              continue;
            }

            let answerCells: any[] = ['']; // default 1 editable cell

            if (q.is_group && q.question_sequence?.group_maxlimit) {
              const limit = Number(q.question_sequence.group_maxlimit) || 1;
              answerCells = Array(limit).fill(''); // create N answer cells
            }

            let limit = 1;
            if (q.is_group && q.question_sequence?.group_maxlimit) {
              limit = Number(q.question_sequence.group_maxlimit) || 1;
            }

            const groupName = q.question_sequence?.group_name || '';

            const row = sheet.addRow([
              q.indicator_name,
              q.question_sequence?.datacube_question?.sub_indicator_name || '',
              q.universal_question_id,
              q.question_sequence?.datacube_question?.question_type,
              groupName, // ✅ NEW VALUE
              q.question_sequence?.datacube_question?.title || '',
              ...answerCells,
            ]);

            (row as any).customGroupLimit = limit; // ✅ THIS is the missing line

            // Style cells
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
              };
              cell.alignment = { wrapText: true, vertical: 'top' };
            });

            // Highlight group question title cell
            if (q.is_group) {
              row.getCell(5).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9E9CF' },
              };
              row.getCell(5).font = { bold: true };
            }

            (row as any).customGroupLimit = limit; // ✅ THIS is the missing line

            // Style cells
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
              };
              cell.alignment = { wrapText: true, vertical: 'top' };
            });

            // Highlight group question title cell
            if (q.is_group) {
              row.getCell(5).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9E9CF' },
              };
              row.getCell(5).font = { bold: true };
            }

            // Set borders and alignment
            for (let i = 1; i <= 6; i++) {
              const cell = row.getCell(i);
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
              };
              cell.alignment = { wrapText: true, vertical: 'top' };
            }

            if (q.is_group) {
              // Highlight Group Name
              row.getCell(5).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9E9CF' },
              };
              // row.getCell(5).font = { bold: true };

              // Highlight Question Title (column 6)
              row.getCell(6).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9E9CF' },
              };
              // row.getCell(6).font = { bold: true };
            } else {
              // Normal cells (non-group)
              row.getCell(5).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEFEFEF' },
              };
              row.getCell(6).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEFEFEF' },
              };
            }

            // -----------------------------
            // Add dropdown if SINGLE_SELECT
            // -----------------------------
            if (
              q.question_sequence?.datacube_question?.question_type ===
              'SINGLE_SELECT'
            ) {
              const questionId = q.question_sequence.datacube_question.id;

              if (questionId) {
                let optionList = dropdownOptionsCache.get(questionId);

                // If not in cache, fetch and cache it
                if (!optionList) {
                  const optionsGet = await this.connection
                    .getRepository(DataCubeQuestionOption)
                    .find({
                      where: { question: { id: questionId } },
                      select: ['text'],
                      relations: ['question'],
                    });

                  optionList = optionsGet
                    .map((opt) => opt.text)
                    .filter(Boolean);
                  dropdownOptionsCache.set(questionId, optionList);
                }

                if (optionList && optionList.length > 0) {
                  const colLetter = sheet.getColumn(dropdownColIndex).letter;

                  // Write options to hidden column on THIS sheet (so relative formula works) starting from row 1000
                  // Defer writing to avoid messing up addRow cursor
                  optionList.forEach((opt, index) => {
                    deferredWrites.push({
                      row: 1000 + index,
                      col: dropdownColIndex,
                      value: opt,
                    });
                  });
                  sheet.getColumn(dropdownColIndex).hidden = true;

                  const startRow = 1000;
                  const endRow = 1000 + optionList.length - 1;
                  const dropdownListFormula = `$${colLetter}$${startRow}:$${colLetter}$${endRow}`;

                  const limit = (row as any).customGroupLimit || 1;

                  // Apply dropdown to answer cells
                  for (let col = 7; col < 7 + limit; col++) {
                    row.getCell(col).dataValidation = {
                      type: 'list',
                      allowBlank: true,
                      formulae: [dropdownListFormula],
                      showErrorMessage: true,
                      errorStyle: 'error',
                      errorTitle: 'Invalid Option',
                      error: 'Please select a value from the dropdown',
                    };
                  }
                  dropdownColIndex++;
                }
              }
            }
          }

          // Execute deferred writes
          deferredWrites.forEach(({ row, col, value }) => {
            sheet.getCell(row, col).value = value;
          });

          sheet.views = [{ state: 'frozen', ySplit: 2 }];

          // Lock/unlock cells
          const totalRows = sheet.rowCount;
          const totalCols = sheet.columnCount;

          for (let r = 3; r <= totalRows; r++) {
            const row = sheet.getRow(r);
            const limit = (row as any).customGroupLimit || 1;

            // Lock columns 1-6 (including Task Question Title)
            for (let c = 1; c <= 6; c++) {
              row.getCell(c).protection = { locked: true };
            }

            // Unlock only the answer cells based on group limit
            for (let c = 7; c < 7 + limit; c++) {
              row.getCell(c).protection = { locked: false };
            }

            // Lock any extra trailing columns
            for (let c = 7 + limit; c <= totalCols; c++) {
              row.getCell(c).protection = { locked: true };
            }
          }

          await sheet.protect('', {
            selectLockedCells: true,
            selectUnlockedCells: true,
          });
        }

        const fileName1 = `yearlynew-${datacubeName}-${firstModuleName}.xlsx`;
        const filePath1 = path.join(targetDir, fileName1);
        await perFreqWorkbook.xlsx.writeFile(filePath1);
        const upload1 = await this.uploadWorkbookToS3(filePath1);
        workbookPaths.push(upload1.url);
        datacubeSheetLink = upload1.url;
        if (taskIdsForDatacube.length > 0) {
          await this.connection.getRepository(DataCubeTask).update(
            { id: In(taskIdsForDatacube) }, // ✅ update all matching task IDs
            { template_yearly_file_url: upload1.url },
          );
        }
      }

      if (!datacubeFreqSheetLink) {
        // -------------------
        // All-tasks workbook
        // -------------------
        const allTasksWorkbook = new ExcelJS.Workbook();
        const allSheet = allTasksWorkbook.addWorksheet('TaskSheet');
        let dropdownColIndexAll = 50; // Start hidden dropdowns at column 50
        const dropdownMapAll = new Map<string, string>();
        // Initialize deferred writes array for all tasks sheet
        const deferredWritesAll: { row: number; col: number; value: string }[] =
          [];

        allSheet.columns = [
          { header: 'Indicator', key: 'indicator', width: 30 },
          { header: 'Sub-Indicator', key: 'subIndicator', width: 30 },
          { header: 'UID', key: 'questionUid', width: 10 },
          { header: 'Question Type', key: 'questionType', width: 15 },
          { header: 'Group Name', key: 'groupName', width: 20 },
          {
            header: 'Task Question Title',
            key: 'taskQuestionTitle',
            width: 80,
          },
          { header: 'Answer', key: 'answer', width: 30 },
        ];

        const questions = datacubeData.questions || [];
        const moduleNameAll = sanitize(questions[0]?.module_name || 'Module');

        allSheet.mergeCells('A1:G1');
        const topCellAll = allSheet.getCell('A1');
        topCellAll.value = `Datacube: ${datacubeName} | Module: ${moduleNameAll}`;
        topCellAll.alignment = { horizontal: 'center', vertical: 'middle' };
        topCellAll.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBEE4F9' },
        };
        allSheet.getRow(1).height = 24;

        // Header
        const headerRowAll = allSheet.addRow([
          'Indicator',
          'Sub-Indicator',
          'UID',
          'Question Type',
          'Group Name',
          'Task Question Title',
          'Answer',
        ]);
        headerRowAll.font = { bold: true };
        headerRowAll.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRowAll.height = 20;

        // Build rows using SAME LOGIC AS YEARLY SHEET
        for (const q of questions) {
          if (
            !q.universal_question_id ||
            q.universal_question_id === 0 ||
            q.universal_question_id === '0'
          )
            continue;

          let limit = 1;
          if (q.is_group && q.question_sequence?.group_maxlimit) {
            limit = Number(q.question_sequence.group_maxlimit) || 1;
          }

          const answerCells = Array(limit).fill('');

          const groupName = q.question_sequence?.group_name || '';

          const row = allSheet.addRow([
            q.indicator_name,
            q.question_sequence?.datacube_question?.sub_indicator_name || '',
            q.universal_question_id,
            q.question_sequence?.datacube_question?.question_type,
            groupName,
            q.question_sequence?.datacube_question?.title || '',
            ...answerCells,
          ]);

          (row as any).customGroupLimit = limit; // ✅ store for lock logic

          // ✅ Apply Dropdown for SINGLE_SELECT (normal + group questions)
          if (
            q.question_sequence?.datacube_question?.question_type ===
            'SINGLE_SELECT'
          ) {
            const questionId = q.question_sequence.datacube_question.id;

            if (questionId) {
              let dropdownListFormula = dropdownMapAll.get(questionId);

              if (!dropdownListFormula) {
                const optionsGet = await this.connection
                  .getRepository(DataCubeQuestionOption)
                  .find({
                    where: { question: { id: questionId } },
                    select: ['text'],
                    relations: ['question'],
                  });

                const optionList = optionsGet
                  .map((opt) => opt.text)
                  .filter(Boolean);

                if (optionList.length > 0) {
                  const colLetter =
                    allSheet.getColumn(dropdownColIndexAll).letter;

                  // Write options to hidden column on THIS sheet (so relative formula works) starting from row 1000
                  // Defer writing to avoid messing up addRow cursor
                  optionList.forEach((opt, index) => {
                    deferredWritesAll.push({
                      row: 1000 + index,
                      col: dropdownColIndexAll,
                      value: opt,
                    });
                  });
                  allSheet.getColumn(dropdownColIndexAll).hidden = true;

                  const startRow = 1000;
                  const endRow = 1000 + optionList.length - 1;
                  dropdownListFormula = `$${colLetter}$${startRow}:$${colLetter}$${endRow}`;
                  dropdownMapAll.set(questionId, dropdownListFormula);
                  dropdownColIndexAll++;
                }
              }

              if (dropdownListFormula) {
                const limit = (row as any).customGroupLimit || 1;

                // ✅ Apply dropdown to ALL answer cells (col 7 onward)
                for (let col = 7; col < 7 + limit; col++) {
                  row.getCell(col).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [dropdownListFormula],
                    showErrorMessage: true,
                    errorStyle: 'error',
                    errorTitle: 'Invalid Option',
                    error: 'Select a value from the dropdown list',
                  };
                }
              }
            }
          }

          // Styling
          row.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            };
            cell.alignment = { wrapText: true, vertical: 'top' };
          });

          if (q.is_group) {
            // Highlight Group Name
            row.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'D9E9CF' },
            };
            // row.getCell(5).font = { bold: true };

            // Highlight Question Title (column 6)
            row.getCell(6).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'D9E9CF' },
            };
            // row.getCell(6).font = { bold: true };
          } else {
            // Normal cells (non-group)
            row.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEFEFEF' },
            };
            row.getCell(6).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEFEFEF' },
            };
          }
        }

        // Execute deferred writes
        deferredWritesAll.forEach(({ row, col, value }) => {
          allSheet.getCell(row, col).value = value;
        });

        // Freeze header
        allSheet.views = [{ state: 'frozen', ySplit: 2 }];

        // Protect: unlock correct cells
        const totalRowsAll = allSheet.rowCount;
        const totalCols = allSheet.columnCount;

        for (let r = 3; r <= totalRowsAll; r++) {
          const row = allSheet.getRow(r);
          const limit = (row as any).customGroupLimit || 1;

          for (let c = 1; c <= 6; c++)
            row.getCell(c).protection = { locked: true };
          for (let c = 7; c < 7 + limit; c++)
            row.getCell(c).protection = { locked: false };
          for (let c = 7 + limit; c <= totalCols; c++)
            row.getCell(c).protection = { locked: true };
        }

        await allSheet.protect('', {
          selectLockedCells: true,
          selectUnlockedCells: true,
        });

        const fileName2 = `perfrequencynew-${datacubeName}-${firstModuleName}.xlsx`;
        const filePath2 = path.join(targetDir, fileName2);
        await allTasksWorkbook.xlsx.writeFile(filePath2);
        const upload2 = await this.uploadWorkbookToS3(filePath2);
        workbookPaths.push(upload2.url);
        datacubeFreqSheetLink = upload2.url;
        if (taskIdsForDatacube.length > 0) {
          await this.connection
            .getRepository(DataCubeTask)
            .update(
              { id: In(taskIdsForDatacube) },
              { template_task_file_url: upload2.url },
            );
        }
      }

      const datacube = await this.connection.getRepository(Datacube).findOne({
        where: { id: datacubeId },
      });
      // await this.activityService.createTenantActivity(
      //   ActivityType.TASK_EXCEL_GENERATED,
      //   datacube,
      //   null,
      //   user,
      // );
      datacubeResults.push({
        datacubeId,
        datacubeSheetLink,
        datacubeFreqSheetLink,
      });
    }

    return datacubeResults;
  }

  async uploadWorkbookToS3(localFilePath: string) {
    try {
      const s3 = this.awsS3Config.getS3();

      const fileStream = fs.createReadStream(localFilePath);
      const fileExtension = path.extname(localFilePath);
      const fileName = path.basename(localFilePath);
      const mimeType = mime.lookup(fileExtension) || 'application/octet-stream';
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.-]/g, '');
      // const key = `excel_exports/${year}/${month}/${localFilePath}${fileExtension}`;
      const key = `excel_exports/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET, // 'rubicr'
        Key: key, // includes 'dev/' folder
        Body: fileStream,
        ACL: 'public-read',
        ContentType: mimeType,
      });

      await s3.send(command);

      fs.unlinkSync(localFilePath);

      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/dev/rubicr/${key}`;

      return {
        url: fileUrl,
        key,
      };
    } catch (err) {
      throw new BadRequestException(
        `Error uploading Excel file to S3 => ${err.message}`,
      );
    }
  }

  async getTaskById(task_id: string) {
    try {
      const task = await this.dataCubeTaskModel.findOne({
        where: { id: task_id, is_deleted: false },
        relations: [
          'datacube_frequency',
          'datacube_frequency.datacube',
          'site',
          'data_provider',
          'data_reviewer',
        ],
      });

      if (!task || task.is_deleted === true) {
        throw new BadRequestException('Task not found');
      }

      const taskQuestions = await this.taskQuestionModel.find({
        where: {
          task: { id: task_id },
          is_deleted: false,
        },
        relations: [
          'question_sequence',
          'question_sequence.datacube_question',
          'question_sequence.datacube_question.datacube_question_options',
          'question_sequence.datacube_question.mixed_questions',
          'question_sequence.group_question_rule',
          'question_sequence.question_rules_id',
          'question_sequence.question_rules_id.dependent_question_id',
          'question_sequence.question_rules_id.dependent_option_id',
          'task_question_answers',
          'task_question_answers.datacube_question',
          'task_comments',
          'task_comments.commented_by',
        ],
        order: {
          question_sequence: {
            sequence: 'ASC',
          },
        },
      });

      // Collect all group question rule IDs (including nested ones)
      const groupQuestionRuleIds = new Set<string>();

      taskQuestions.forEach((tq) => {
        const ruleId = tq.question_sequence?.group_question_rule?.id;
        if (ruleId) {
          groupQuestionRuleIds.add(ruleId);
        }
      });

      if (groupQuestionRuleIds.size > 0) {
        // Load all group rules with their full hierarchy
        const groupRules = await this.loadGroupQuestionsRecursively(
          Array.from(groupQuestionRuleIds),
        );

        const groupRulesMap = new Map<string, DataCubeGroupQuestionsRule>(
          groupRules.map((gr) => [gr.id, gr]),
        );

        for (const tq of taskQuestions) {
          const groupRuleId = tq.question_sequence?.group_question_rule?.id;
          if (groupRuleId) {
            const fullGroupRule = groupRulesMap.get(groupRuleId);
            if (fullGroupRule && tq.question_sequence) {
              Object.assign(
                tq.question_sequence.group_question_rule,
                fullGroupRule,
              );
            }
          }
        }
      }

      task.task_questions = taskQuestions;

      return {
        success: true,
        task,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch task');
    }
  }

  // Helper method to recursively load group questions
  private async loadGroupQuestionsRecursively(
    ruleIds: string[],
    loadedIds: Set<string> = new Set(),
    depth = 0,
  ): Promise<DataCubeGroupQuestionsRule[]> {
    // Prevent infinite recursion
    if (depth > 5 || ruleIds.length === 0) {
      return [];
    }

    // Filter out already loaded IDs
    const idsToLoad = ruleIds.filter((id) => !loadedIds.has(id));
    if (idsToLoad.length === 0) {
      return [];
    }

    // Mark these IDs as loaded
    idsToLoad.forEach((id) => loadedIds.add(id));

    const groupRules = await this.connection
      .getRepository(DataCubeGroupQuestionsRule)
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.datacube_group_questions', 'group_questions')
      .leftJoinAndSelect('group_questions.datacube_question', 'question')
      .leftJoinAndSelect('question.datacube_question_options', 'options')
      .leftJoinAndSelect('question.mixed_questions', 'mixed')
      .leftJoinAndSelect('group_questions.group_question_rule', 'nested_rule')
      .where('rule.id IN (:...ids)', { ids: idsToLoad })
      .andWhere('rule.is_deleted = :deleted', { deleted: false })
      .orderBy('group_questions.group_sequence', 'ASC')
      .getMany();

    // Collect nested rule IDs
    const nestedRuleIds: string[] = [];
    groupRules.forEach((rule) => {
      rule.datacube_group_questions?.forEach((gq) => {
        const nestedRuleId = gq.group_question_rule?.id;
        if (nestedRuleId && !loadedIds.has(nestedRuleId)) {
          nestedRuleIds.push(nestedRuleId);
        }
      });
    });

    // Recursively load nested rules
    if (nestedRuleIds.length > 0) {
      const nestedRules = await this.loadGroupQuestionsRecursively(
        nestedRuleIds,
        loadedIds,
        depth + 1,
      );

      // Map nested rules back to their parent group questions
      const nestedRulesMap = new Map(nestedRules.map((nr) => [nr.id, nr]));

      groupRules.forEach((rule) => {
        rule.datacube_group_questions?.forEach((gq) => {
          const nestedRuleId = gq.group_question_rule?.id;
          if (nestedRuleId) {
            const fullNestedRule = nestedRulesMap.get(nestedRuleId);
            if (fullNestedRule) {
              gq.group_question_rule = fullNestedRule;
            }
          }
        });
      });
    }

    return groupRules;
  }

  async createDataCubeTask(body: CreateDataCubeTaskDto, user: User) {
    const querryRunner = this.connection.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();
    try {
      const dataCube = await querryRunner.manager
        .getRepository(DataCubeFrequency)
        .findOne({
          where: { datacube: { id: body.datacube_id } },
        });
      if (!dataCube) {
        throw new BadRequestException('Data cube frequency not found');
      }
      if (body.tasks[0]?.questions?.length === 0) {
        throw new BadRequestException('Questions not found');
      }

      for (const task of body.tasks) {
        for (const site of task.sites) {
          const dataCubeFrequency = await querryRunner.manager
            .getRepository(DataCubeFrequency)
            .find({
              where: { datacube: { id: body.datacube_id } },
              relations: ['datacube'],
            });
          if (!dataCubeFrequency) {
            throw new BadRequestException('Data cube frequency not found');
          }
          const questionSequences = await querryRunner.manager
            .getRepository(DataCubeQuestionSequences)
            .find({
              where: {
                id: In(task?.questions),
              },
            });
          if (questionSequences.length !== task.questions.length) {
            // check if the questions are in the questionSequences
            throw new BadRequestException(`Questions not found`);
          }
          const questionGroupByModule = questionSequences.reduce(
            (acc, seq) => {
              const moduleId = seq.public_module_id || 'unknown';
              if (!acc[moduleId]) acc[moduleId] = [];
              acc[moduleId].push(seq);
              return acc;
            },
            {} as Record<string, DataCubeQuestionSequences[]>,
          );
          for (const questionSequence of Object.values(questionGroupByModule)) {
            for (const frequency of dataCubeFrequency) {
              const taskObj = await querryRunner.manager.create(DataCubeTask, {
                datacube_frequency: { id: frequency?.id },
                site: { id: site },
                data_provider: { id: task?.data_provider },
                data_reviewer: { id: task?.data_reviewer },
                status: task?.status,
              });

              const savedTask = await querryRunner.manager.save(taskObj);

              await this.activityService.createTenantActivity(
                ActivityType.TASK_CREATED,
                frequency.datacube,
                savedTask,
                user,
                querryRunner,
              );

              for (const question of questionSequence) {
                const existingData = await querryRunner.manager
                  .getRepository(TaskQuestion)
                  .findOne({
                    where: {
                      question_sequence: { id: question.id },
                      site,
                      datacube_frequency: frequency.id,
                    },
                  });

                if (existingData) {
                  throw new BadRequestException('Task already exists');
                }
                const taskQuestion = await querryRunner.manager
                  .getRepository(TaskQuestion)
                  .create({
                    task: { id: savedTask.id },
                    question_sequence: { id: question.id },
                    is_answered: false,
                    datacube_frequency: frequency.id,
                    site,
                    universal_question_id: question.universal_question_id,
                  });
                await querryRunner.manager
                  .getRepository(TaskQuestion)
                  .save(taskQuestion);
              }
            }
          }
        }
      }
      await querryRunner.commitTransaction();
      return {
        success: true,
        message: 'Task created successfully',
      };
    } catch (error) {
      await querryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await querryRunner.release();
    }
  }

  async findDataCubeFrequency(id, queryRunner) {
    return await queryRunner.manager
      .getRepository(DataCubeFrequency)
      .findOne({ where: { datacube: { id } } });
  }

  async createTaskQuestions(body, site, querryRunner, dataCubeFrequency) {
    try {
      const questionSequences = await querryRunner.manager
        .getRepository(DataCubeQuestionSequences)
        .find({
          where: {
            id: In(body.questions),
          },
        });

      if (questionSequences.length !== body.questions.length) {
        // check if the questions are in the questionSequences
        throw new BadRequestException(`Questions not found`);
      }
      const questionGroupByModule = questionSequences.reduce((acc, seq) => {
        const moduleId = seq.public_module_id || 'unknown';
        if (!acc[moduleId]) acc[moduleId] = [];
        acc[moduleId].push(seq);
        return acc;
      }, {});
      Object.values(questionGroupByModule).forEach(async (questionSequence) => {
        const taskObj = await querryRunner.manager.create(DataCubeTask, {
          datacube_frequency: { id: dataCubeFrequency.id },
          site: { id: site },
          data_provider: { id: body.data_provider },
          data_reviewer: { id: body.data_reviewer },
          status: body.status,
        });

        const task = await querryRunner.manager.save(taskObj);
        Object.values(questionSequence).forEach(async (question) => {
          const taskQuestion = await querryRunner.manager
            .getRepository(TaskQuestion)
            .save({
              task: { id: task.id },
              question_sequence: { id: question.id },
              is_answered: false,
              universal_question_id: question.universal_question_id,
              datacube_frequency: { id: dataCubeFrequency.id },
              site: { id: site },
            });
        });
      });
    } catch (error) {
      // await querryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    }
  }

  async createTaskResponse(body: ResponseDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const ans of body.responses) {
        const taskQuestion = await queryRunner.manager
          .getRepository(TaskQuestion)
          .findOne({
            where: { id: ans.task_question },
            relations: [
              'question_sequence',
              'question_sequence.datacube_question',
            ],
          });

        if (!taskQuestion) {
          throw new BadRequestException('Task question not found');
        }

        let universalQuestionId: string | null = null;

        if (ans.datacube_question) {
          const datacubeQuestion = await queryRunner.manager
            .getRepository(DataCubeQuestion)
            .findOne({ where: { id: ans.datacube_question } });

          if (!datacubeQuestion) {
            throw new BadRequestException('Datacube question not found');
          }

          universalQuestionId = datacubeQuestion.universal_question_id;
        } else {
          universalQuestionId = taskQuestion.universal_question_id;
        }

        const t_question = await queryRunner.manager
          .getRepository(TaskQuestionAnswer)
          .findOne({
            where: {
              task_question: { id: ans.task_question },
              datacube_question: { id: ans?.datacube_question },
            },
          });
        if (t_question) {
          await queryRunner.manager
            .getRepository(TaskQuestionAnswer)
            .update(t_question.id, {
              answer: ans.answer,
              question_sequence_type: ans?.question_sequence_type,
              updatedAt: new Date(),
              parent_option_id: ans?.parent_option_id
                ? { id: ans.parent_option_id }
                : null,
              rule_question_id: ans?.rule_question_id
                ? { id: ans.rule_question_id }
                : null,
              group_questions_rule_id: ans?.group_questions_rule_id
                ? { id: ans.group_questions_rule_id }
                : null,
              mixed_question_id: ans?.mixed_question_id
                ? { id: ans.mixed_question_id }
                : null,
              // universal_question_id: taskQuestion.universal_question_id,
              universal_question_id: universalQuestionId,
            });
          continue;
        } else {
          const taskQuestionAnswer = await queryRunner.manager
            .getRepository(TaskQuestionAnswer)
            .create({
              task_question: { id: ans.task_question },
              datacube_question: {
                id: ans?.datacube_question,
              },
              answer: ans.answer,
              question_sequence_type: ans?.question_sequence_type,
              index: null,
              createdAt: new Date(),
              // universal_question_id: taskQuestion.universal_question_id,
              universal_question_id: universalQuestionId,
              parent_option_id: ans?.parent_option_id
                ? { id: ans.parent_option_id }
                : null,
              rule_question_id: ans?.rule_question_id
                ? { id: ans.rule_question_id }
                : null,
              group_questions_rule_id: ans?.group_questions_rule_id
                ? { id: ans.group_questions_rule_id }
                : null,
              mixed_question_id: ans?.mixed_question_id
                ? { id: ans.mixed_question_id }
                : null,
            });

          await queryRunner.manager
            .getRepository(TaskQuestion)
            .update(ans.task_question, {
              is_answered: ans.answer?.length > 0,
            });

          await queryRunner.manager
            .getRepository(TaskQuestionAnswer)
            .save(taskQuestionAnswer);
        }
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Task response saved successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error?.message || 'Unknown error');
    } finally {
      await queryRunner.release();
    }
  }

  async updateTaskResponse(id: string, body: UpdateTaskResponseDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingData = await queryRunner.manager
        .getRepository(TaskQuestionAnswer)
        .findOne({
          where: { id },
        });

      if (!existingData) {
        throw new BadRequestException('Task response not found.');
      }

      let universalQuestionId: string | null = null;
      if (body.datacube_question) {
        const datacubeQuestion = await queryRunner.manager
          .getRepository(DataCubeQuestion)
          .findOne({ where: { id: body.datacube_question } });

        if (!datacubeQuestion) {
          throw new BadRequestException('Datacube question not found');
        }

        universalQuestionId = datacubeQuestion.universal_question_id;
      } else {
        universalQuestionId = existingData.universal_question_id;
      }

      await queryRunner.manager.getRepository(TaskQuestionAnswer).update(id, {
        task_question: { id: body.task_question },
        datacube_question: { id: body.datacube_question },
        answer: body.answer,
        question_sequence_type: body.question_sequence_type,
        index: null,
        updatedAt: new Date(),
        parent_option_id: body?.parent_option_id
          ? { id: body.parent_option_id }
          : null,
        rule_question_id: body?.rule_question_id
          ? { id: body.rule_question_id }
          : null,
        group_questions_rule_id: body?.group_questions_rule_id
          ? { id: body.group_questions_rule_id }
          : null,
        // universal_question_id: existingData.universal_question_id,
        universal_question_id: universalQuestionId,
        mixed_question_id: body?.mixed_question_id
          ? { id: body.mixed_question_id }
          : null,
      });

      await queryRunner.manager
        .getRepository(TaskQuestion)
        .update(body.task_question, {
          is_answered: body.answer?.length > 0,
        });

      const updatedRecord = await queryRunner.manager
        .getRepository(TaskQuestionAnswer)
        .findOne({
          where: { id },
          relations: ['task_question', 'datacube_question'],
        });

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Task response updated successfully',
        data: updatedRecord,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error?.message || 'Update failed.');
    } finally {
      await queryRunner.release();
    }
  }

  async createTaskSheetResponse(body: BulkUploadDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { datacubeId, moduleId, siteId, frequency } = body;
      // 1. Build frequency map (name -> id)
      const frequencies = await queryRunner.manager
        .getRepository(DataCubeFrequency)
        .find({
          where: { datacube: { id: datacubeId } },
        });
      const frequencyMap = new Map(
        frequencies.map((f) => [f.frequency_name, f.id]),
      );
      // 2. Load question sequences for module
      const questionSequences = await this.connection
        .getRepository(DataCubeQuestionSequences)
        .find({
          where: {
            datacube: { id: datacubeId },
            public_module_id: moduleId,
          },
          select: [
            'id',
            'universal_question_id',
            'questable_type',
            // 'datacube_question', // Remove from select if using relations, or keep if needed for ID. Best to rely on relation.
            'is_dependent',
          ],
          relations: ['datacube_question'],
        });

      // ✅ Fetch Mixed Type Configurations
      const dcQuestionIds = questionSequences
        .map((qs) => qs.datacube_question?.id)
        .filter(Boolean);

      const mixedTypeConfigs = await queryRunner.manager
        .getRepository(DataCubeMixedTypeQuestion)
        .find({
          where: { question: { id: In(dcQuestionIds) } },
          relations: ['question'],
        });

      const mixedTypeMap = new Map(
        mixedTypeConfigs.map((cfg) => [cfg.question.id, cfg]),
      );

      const questionSequenceIds = questionSequences.map((q) => q.id);
      const responseArray: any[] = [];
      // 3. Process each frequency group in the payload
      for (const monthName of Object.keys(frequency)) {
        const frequencyId = frequencyMap.get(monthName);
        if (!frequencyId) {
          throw new BadRequestException(
            `Frequency '${monthName}' not found for datacube ${datacubeId}`,
          );
        }
        const answersForMonth = frequency[monthName]; // array of { questionUid, isGroup, answers: [] }
        // 4. Load task questions for this frequency and site; map by universal_question_id
        const taskQuestions = await queryRunner.manager
          .getRepository(TaskQuestion)
          .find({
            where: {
              datacube_frequency: frequencyId,
              question_sequence: In(questionSequenceIds),
              site: siteId,
            },
            relations: [
              'question_sequence',
              'question_sequence.datacube_question',
              'question_sequence.group_question_rule',
              'task',
            ],
          });
        const taskQuestionMap = new Map(
          taskQuestions.map((tq) => [tq.universal_question_id, tq]),
        );

        // ✅ Cache for GROUP TaskQuestions: Map<parentTaskQuestionId, Map<answerIndex, TaskQuestion>>
        const groupInstanceTaskQuestionCache = new Map<
          string,
          Map<number, any>
        >();

        // 5. Iterate uploaded rows
        for (const uploadedRow of answersForMonth) {
          const { questionUid, isGroup, answers } = uploadedRow;

          if (!questionUid) continue;
          // Normalize answers array
          const rawAnswers: any[] = Array.isArray(answers)
            ? answers
            : [answers];
          // Trim/normalize each element; keep zeros
          const normalizedAnswers = rawAnswers
            .map((v: any) =>
              v === 0 || v === '0'
                ? 0
                : v === null || v === undefined
                  ? ''
                  : String(v).trim(),
            )
            .filter((v: any, idx: number) => {
              // keep empties for the first element (we may want to validate later); keep all so index alignment preserved
              return true;
            });
          // find taskQuestion
          let origTaskQuestion = taskQuestionMap.get(questionUid);

          // If not found directly and this is marked as a GROUP question, search for the parent GROUP TaskQuestion
          if (!origTaskQuestion && isGroup) {
            // Find which GROUP contains this child UID
            // ⚠️ IMPORTANT: Iterate through taskQuestions array, NOT taskQuestionMap
            // Multiple GROUP TaskQuestions can have the same universal_question_id (e.g., '0'),
            // which causes map key collisions. We need to check ALL TaskQuestions.
            for (const tq of taskQuestions) {
              if (
                tq.question_sequence?.questable_type === 'GROUP' &&
                tq.question_sequence?.group_question_rule?.id
              ) {
                try {
                  const groupQuestions = await queryRunner.manager
                    .getRepository(DataCubeGroupQuestions)
                    .find({
                      where: {
                        group_question_rule: {
                          id: tq.question_sequence.group_question_rule.id,
                        },
                        universal_question_id: questionUid,
                      },
                    });

                  if (groupQuestions.length > 0) {
                    origTaskQuestion = tq;

                    break;
                  }
                } catch (err) {
                  console.warn(
                    `⚠️ Error checking GROUP ${tq.id}:`,
                    err.message,
                  );
                }
              }
            }
          }

          if (!origTaskQuestion) {
            // skip if task question not found
            responseArray.push({
              status: 'skipped',
              reason: 'task_question_not_found',
              questionUid,
              monthName,
            });
            continue;
          }
          const questionSeq = origTaskQuestion.question_sequence;
          let datacubeQuestion = questionSeq.datacube_question;

          // For GROUP questions, load the specific child's datacube_question that matches questionUid
          if (!datacubeQuestion && questionSeq.questable_type === 'GROUP') {
            const childQuestion = await queryRunner.manager
              .getRepository(DataCubeGroupQuestions)
              .findOne({
                where: {
                  group_question_rule: {
                    id: questionSeq.group_question_rule.id,
                  },
                  universal_question_id: questionUid, // ✅ Match the specific child UID
                },
                relations: ['datacube_question'],
              });

            if (childQuestion?.datacube_question) {
              datacubeQuestion = childQuestion.datacube_question;
            } else {
              throw new BadRequestException(
                `Could not find datacube_question for GROUP child UID: ${questionUid}`,
              );
            }
          }

          // Validate datacubeQuestion exists before accessing its properties
          if (!datacubeQuestion) {
            throw new BadRequestException(
              `datacube_question not found for UID: ${questionUid}`,
            );
          }

          const questType = datacubeQuestion.question_type;
          const isDependent = questionSeq?.is_dependent;

          // If not a group, only look at first answer and save it
          if (!isGroup) {
            const val = normalizedAnswers[0];
            if (
              val === null ||
              val === undefined ||
              (typeof val === 'string' && val.trim() === '')
            ) {
              throw new BadRequestException(
                `Answer cannot be empty for UID: ${questionUid} for frequency ${monthName}`,
              );
            }
            // process by type
            let processedAnswer: any = val;
            if (questType === 'TEXT') {
              if (typeof val !== 'string')
                throw new BadRequestException(
                  `Invalid TEXT answer for UID: ${questionUid}`,
                );
              processedAnswer = val;
            } else if (questType === 'NUMBER') {
              if (isNaN(Number(val)))
                throw new BadRequestException(
                  `Invalid NUMBER answer for UID: ${questionUid}`,
                );
              processedAnswer = Number(val) === 0 ? '0' : val;
            } else if (questType === 'SINGLE_SELECT') {
              const option = await queryRunner.manager
                .getRepository(DataCubeQuestionOption)
                .findOne({
                  where: {
                    question: { id: datacubeQuestion.id },
                    text: String(val),
                  },
                  select: ['id'],
                });

              if (!option)
                throw new BadRequestException(
                  `Option not found for SINGLE_SELECT UID: ${questionUid}, answer: ${val}`,
                );
              processedAnswer = option.id;
            } else if (questType === 'MIXED_TYPE') {
              // Basic validation; keep original string
              let raw = val;
              if (typeof raw !== 'string') raw = String(raw);

              // ✅ Strict Validation for Mixed Type
              const mixedConfig = mixedTypeMap.get(datacubeQuestion.id);
              if (mixedConfig) {
                const hasUnits =
                  mixedConfig.unit_enum?.length > 0 || !!mixedConfig.unit_name;

                if (hasUnits && raw !== '0') {
                  if (!raw.includes(',')) {
                    throw new BadRequestException(
                      `Invalid format for UID: ${questionUid}. Expected "value, unit" (e.g., "100, kg").`,
                    );
                  }

                  const parts = raw.split(',');
                  if (parts.length < 2) {
                    throw new BadRequestException(
                      `Invalid format for UID: ${questionUid}. Missing unit after comma.`,
                    );
                  }

                  const unitPart = parts[1].trim();

                  if (mixedConfig.unit_enum?.length > 0) {
                    if (!mixedConfig.unit_enum.includes(unitPart)) {
                      throw new BadRequestException(
                        `Invalid unit "${unitPart}" for UID: ${questionUid}. Allowed: ${mixedConfig.unit_enum.join(', ')}`,
                      );
                    }
                  }
                }
              }

              // minimal validation (you can keep your previous logic)
              const match = raw.match(/^(\d+)(.*)$/);
              if (!match)
                throw new BadRequestException(
                  `Invalid MIXED_TYPE answer format for UID: ${questionUid}`,
                );
              processedAnswer = raw;
            }
            // Save/Update answer for origTaskQuestion
            const existingAnswer = await queryRunner.manager
              .getRepository(TaskQuestionAnswer)
              .findOne({
                where: { task_question: { id: origTaskQuestion.id } },
              });
            if (existingAnswer) {
              existingAnswer.answer = processedAnswer;
              existingAnswer.datacube_question = datacubeQuestion;
              existingAnswer.universal_question_id = questionUid;
              existingAnswer.question_sequence_type =
                questionSeq.questable_type;
              await queryRunner.manager
                .getRepository(TaskQuestionAnswer)
                .save(existingAnswer);
            } else {
              const newAns = queryRunner.manager
                .getRepository(TaskQuestionAnswer)
                .create({
                  task_question: origTaskQuestion,
                  datacube_question: datacubeQuestion,
                  universal_question_id: questionUid,
                  question_sequence_type: questionSeq.questable_type,
                  answer: processedAnswer,
                });
              await queryRunner.manager
                .getRepository(TaskQuestionAnswer)
                .save(newAns);
              await queryRunner.manager
                .getRepository(TaskQuestion)
                .update({ id: origTaskQuestion.id }, { is_answered: true });
            }
            responseArray.push({
              questionUid,
              storedForTaskQuestionId: origTaskQuestion.id,
              monthName,
              processedAnswer,
            });
          } else {
            // GROUP question handling

            // Validate at least one answer exists
            if (normalizedAnswers.length === 0 || normalizedAnswers[0] === '') {
              throw new BadRequestException(
                `At least one answer required for GROUP question UID: ${questionUid} for ${monthName}`,
              );
            }

            // ✅ Create a cache key for this GROUP (use the parent TaskQuestion ID)
            const groupTaskQuestionId = origTaskQuestion.id;

            // ✅ Initialize cache for this GROUP if not exists
            if (!groupInstanceTaskQuestionCache.has(groupTaskQuestionId)) {
              groupInstanceTaskQuestionCache.set(
                groupTaskQuestionId,
                new Map(),
              );

              // ✅ Load all existing TaskQuestions for this GROUP from database
              const existingGroupTaskQuestions = await queryRunner.manager
                .getRepository(TaskQuestion)
                .find({
                  where: {
                    task: { id: origTaskQuestion.task.id },
                    question_sequence: {
                      id: origTaskQuestion.question_sequence.id,
                    },
                    datacube_frequency: frequencyId,
                    site: siteId,
                    universal_question_id:
                      origTaskQuestion.universal_question_id,
                  },
                  order: { createdAt: 'ASC' }, // Order by creation time
                });

              // Populate cache with existing TaskQuestions (index 0, 1, 2, ...)
              existingGroupTaskQuestions.forEach((tq, index) => {
                groupInstanceTaskQuestionCache
                  .get(groupTaskQuestionId)
                  .set(index, tq);
              });
            }

            const groupCache =
              groupInstanceTaskQuestionCache.get(groupTaskQuestionId);

            // Process each answer in the array
            for (let i = 0; i < normalizedAnswers.length; i++) {
              const rawVal = normalizedAnswers[i];

              // Skip empty entries after the first one
              if (
                i > 0 &&
                (rawVal === '' || rawVal === null || rawVal === undefined)
              ) {
                continue;
              }

              // First entry cannot be empty
              if (
                i === 0 &&
                (rawVal === '' || rawVal === null || rawVal === undefined)
              ) {
                throw new BadRequestException(
                  `First answer cannot be empty for GROUP UID: ${questionUid} for ${monthName}`,
                );
              }

              // ✅ Check if TaskQuestion exists in cache (from DB or newly created in this session)
              let targetTaskQuestion;

              if (groupCache.has(i)) {
                targetTaskQuestion = groupCache.get(i);
              } else {
                // Create new TaskQuestion only if it doesn't exist

                const newTaskQuestion = await queryRunner.manager
                  .getRepository(TaskQuestion)
                  .create({
                    task: origTaskQuestion.task,
                    question_sequence: origTaskQuestion.question_sequence,
                    is_answered: false,
                    site: origTaskQuestion.site,
                    datacube_frequency: origTaskQuestion.datacube_frequency,
                    universal_question_id:
                      origTaskQuestion.universal_question_id,
                  });

                const savedTaskQuestion = await queryRunner.manager
                  .getRepository(TaskQuestion)
                  .save(newTaskQuestion);
                targetTaskQuestion = savedTaskQuestion;
                groupCache.set(i, savedTaskQuestion);
              }

              // Validate and process based on question type
              let processedAnswer: any = rawVal;

              if (questType === 'TEXT') {
                if (typeof rawVal !== 'string' && rawVal !== 0) {
                  throw new BadRequestException(
                    `Invalid TEXT answer for UID: ${questionUid}`,
                  );
                }
                processedAnswer = String(rawVal);
              } else if (questType === 'NUMBER') {
                if (isNaN(Number(rawVal))) {
                  throw new BadRequestException(
                    `Invalid NUMBER answer for UID: ${questionUid}, value: ${rawVal}`,
                  );
                }
                processedAnswer = Number(rawVal) === 0 ? '0' : String(rawVal);
              } else if (questType === 'SINGLE_SELECT') {
                const option = await queryRunner.manager
                  .getRepository(DataCubeQuestionOption)
                  .findOne({
                    where: {
                      question: { id: datacubeQuestion.id },
                      text: String(rawVal),
                    },
                    select: ['id'],
                  });

                if (!option) {
                  throw new BadRequestException(
                    `Option not found for SINGLE_SELECT UID: ${questionUid}, answer: ${rawVal}`,
                  );
                }
                processedAnswer = option.id;
              } else if (questType === 'MIXED_TYPE') {
                const raw = String(rawVal);

                // ✅ Strict Validation for Mixed Type (Group)
                const mixedConfig = mixedTypeMap.get(datacubeQuestion.id);
                if (mixedConfig) {
                  const hasUnits =
                    mixedConfig.unit_enum?.length > 0 ||
                    !!mixedConfig.unit_name;

                  if (hasUnits && raw !== '0') {
                    if (!raw.includes(',')) {
                      throw new BadRequestException(
                        `Invalid format for UID: ${questionUid}. Expected "value, unit" (e.g., "100, kg").`,
                      );
                    }

                    const parts = raw.split(',');
                    if (parts.length < 2) {
                      throw new BadRequestException(
                        `Invalid format for UID: ${questionUid}. Missing unit after comma.`,
                      );
                    }

                    const unitPart = parts[1].trim();

                    if (mixedConfig.unit_enum?.length > 0) {
                      if (!mixedConfig.unit_enum.includes(unitPart)) {
                        throw new BadRequestException(
                          `Invalid unit "${unitPart}" for UID: ${questionUid}. Allowed: ${mixedConfig.unit_enum.join(', ')}`,
                        );
                      }
                    }
                  }
                }

                const match = raw.match(/^(\d+)(.*)$/);
                if (!match) {
                  throw new BadRequestException(
                    `Invalid MIXED_TYPE answer format for UID: ${questionUid}, value: ${rawVal}`,
                  );
                }
                processedAnswer = raw;
              }

              // Save the answer to the appropriate TaskQuestion

              const existingAnswer = await queryRunner.manager
                .getRepository(TaskQuestionAnswer)
                .findOne({
                  where: {
                    task_question: { id: targetTaskQuestion.id },
                    datacube_question: { id: datacubeQuestion.id },
                  },
                });

              if (existingAnswer) {
                existingAnswer.answer = processedAnswer;
                existingAnswer.datacube_question = datacubeQuestion;
                existingAnswer.universal_question_id = questionUid;
                existingAnswer.question_sequence_type =
                  questionSeq.questable_type;
                await queryRunner.manager.save(
                  TaskQuestionAnswer,
                  existingAnswer,
                );
              } else {
                const newAns = queryRunner.manager.create(TaskQuestionAnswer, {
                  task_question: targetTaskQuestion,
                  datacube_question: datacubeQuestion,
                  universal_question_id: questionUid,
                  question_sequence_type: questionSeq.questable_type,
                  answer: processedAnswer,
                });
                await queryRunner.manager.save(TaskQuestionAnswer, newAns);
              }

              // Mark TaskQuestion as answered
              await queryRunner.manager.update(
                TaskQuestion,
                { id: targetTaskQuestion.id },
                { is_answered: true },
              );

              responseArray.push({
                questionUid,
                storedForTaskQuestionId: targetTaskQuestion.id,
                monthName,
                index: i,
                processedAnswer,
              });
            } // end loop normalizedAnswers
          } // end GROUP handling
        } // end loop uploaded rows
      } // end loop months

      // ✅ Save uploaded file URL to tasks
      if (body.uploadedFileUrl) {
        const taskQuestionIds = responseArray
          .filter((r) => r.storedForTaskQuestionId)
          .map((r) => r.storedForTaskQuestionId);
        if (taskQuestionIds.length > 0) {
          const taskQuestions = await queryRunner.manager
            .getRepository(TaskQuestion)
            .find({
              where: { id: In([...new Set(taskQuestionIds)]) },
              relations: ['task'],
            });
          const uniqueTaskIds = [
            ...new Set(taskQuestions.map((tq) => tq.task?.id).filter(Boolean)),
          ];
          if (uniqueTaskIds.length > 0) {
            // ✅ Save to correct column based on isYearly flag
            // Handle both boolean and string "true" from frontend
            const isYearlyUpload =
              (body.isYearly as any) === true ||
              (body.isYearly as any) === 'true';
            const updateData = isYearlyUpload
              ? { uploaded_yearly_file_url: body.uploadedFileUrl }
              : { uploaded_task_file_url: body.uploadedFileUrl };
            await queryRunner.manager
              .getRepository(DataCubeTask)
              .update({ id: In(uniqueTaskIds) }, updateData);
          }
        }
      }

      await queryRunner.commitTransaction();
      return {
        status: 'Success',
        message: 'Sheet Uploaded Successfully',
        data: responseArray,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createTaskComments(id: string, body: TaskCommentsDto, user: User) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = await queryRunner.manager
        .getRepository(DataCubeTask)
        .findOne({
          where: { id },
          relations: ['datacube_frequency.datacube'],
        });
      // Process each comment in the array
      for (const com of body.task_comments) {
        // Create the task comment record
        const taskComments = await queryRunner.manager
          .getRepository(TaskComments)
          .create({
            task: { id },
            task_question: { id: com.task_question_id },
            commented_by: { id: com.commented_by },
            comment: com.comment,
          });

        await queryRunner.manager
          .getRepository(TaskComments)
          .save(taskComments);
      }
      await this.activityService.createTenantActivity(
        ActivityType.TASK_COMMENTED,
        task.datacube_frequency.datacube,
        task,
        user,
        queryRunner,
      );
      // Commit the transaction once all operations are completed
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Task reviewed successfully',
      };
    } catch (error) {
      // Rollback if any error occurs
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }

  async reassignTask(id: string, body: ReassignTaskDto, user: User) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = await queryRunner.manager
        .getRepository(DataCubeTask)
        .findOne({
          where: { id },
          relations: [
            'datacube_frequency',
            'datacube_frequency.datacube',
            'data_reviewer',
            'data_provider',
            'site',
          ],
        });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      await queryRunner.manager.getRepository(DataCubeTask).update(id, {
        data_reviewer: { id: body.data_reviewer },
        data_provider: { id: body.data_provider },
        status: TaskStatus.REASSIGNED,
      });

      await this.activityService.createTenantActivity(
        ActivityType.TASK_REASSIGNED,
        task.datacube_frequency.datacube,
        task,
        user,
        queryRunner,
      );

      const updatedTask = await queryRunner.manager
        .getRepository(DataCubeTask)
        .findOne({
          where: { id },
          relations: [
            'datacube_frequency',
            'datacube_frequency.datacube',
            'data_reviewer',
            'data_provider',
            'site',
          ],
        });

      // await this.mailService.send('task-re-assigned-notification', {
      //   to: updatedTask.data_reviewer.email,
      //   subject: 'Task Re-assigned on Rubicr',
      //   template: 'task-re-assigned-notification',
      //   context: {
      //     task: updatedTask,
      //     data_provider: updatedTask.data_provider,
      //     data_provider_email: updatedTask.data_provider.email,
      //     task_name: updatedTask.datacube_frequency.datacube.name,
      //     data_reviewer: updatedTask.data_reviewer.name,
      //     data_reviewer_email: updatedTask.data_reviewer.email,
      //     accountName: user.account.slug,
      //     ownerName: user.name,
      //     site_name: updatedTask.site.name,
      //   },
      // });

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Task re-assigned successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async reassignTasks(
    taskIds: string[],
    body: BulkReassignTaskDto | ReassignTaskDto,
    user: User,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate all tasks exist
      const tasks = await queryRunner.manager.getRepository(DataCubeTask).find({
        where: { id: In(taskIds) },
        relations: [
          'datacube_frequency',
          'datacube_frequency.datacube',
          'data_reviewer',
          'data_provider',
          'site',
        ],
      });

      if (tasks.length === 0) {
        throw new BadRequestException('No tasks found');
      }

      if (tasks.length !== taskIds.length) {
        const foundIds = tasks.map((t) => t.id);
        const missingIds = taskIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `Tasks not found: ${missingIds.join(', ')}`,
        );
      }

      // Prepare update data
      const updateData: any = {
        status: TaskStatus.REASSIGNED,
      };

      if (body.data_reviewer) {
        updateData.data_reviewer = { id: body.data_reviewer };
      }

      if (body.data_provider) {
        updateData.data_provider = { id: body.data_provider };
      }

      // Update all tasks
      await queryRunner.manager
        .getRepository(DataCubeTask)
        .update({ id: In(taskIds) }, updateData);

      await this.activityService.createTenantActivity(
        ActivityType.TASK_REASSIGNED,
        tasks[0].datacube_frequency.datacube,
        tasks[0],
        user,
        queryRunner,
      );

      // Fetch updated tasks
      const updatedTasks = await queryRunner.manager
        .getRepository(DataCubeTask)
        .find({
          where: { id: In(taskIds) },
          relations: [
            'datacube_frequency',
            'datacube_frequency.datacube',
            'data_reviewer',
            'data_provider',
            'site',
          ],
        });

      // // Send email notifications for each task
      // const emailPromises = updatedTasks.map((task) =>
      //   this.mailService.send('task-re-assigned-notification', {
      //     to: task.data_reviewer.email,
      //     subject: 'Task Re-assigned on Rubicr',
      //     template: 'task-re-assigned-notification',
      //     context: {
      //       task,
      //       data_provider: task.data_provider,
      //       data_provider_email: task.data_provider.email,
      //       task_name: task.datacube_frequency.datacube.name,
      //       data_reviewer: task.data_reviewer.name,
      //       data_reviewer_email: task.data_reviewer.email,
      //       accountName: user.account.slug,
      //       ownerName: user.name,
      //       site_name: task.site.name,
      //     },
      //   }),
      // );

      // // Send all emails in parallel (optional: use Promise.allSettled for better error handling)
      // await Promise.all(emailPromises);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `${taskIds.length} task(s) re-assigned successfully`,
        data: {
          reassigned_count: taskIds.length,
          task_ids: taskIds,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || error);
    } finally {
      await queryRunner.release();
    }
  }

  // async bulkChangeTaskStatus(ids: string[], status: TaskStatus, user: IUser) {
  //   const results = [];

  //   for (const id of ids) {
  //     try {
  //       const result = await this.changeTaskStatus(id, { status }, user);
  //       results.push({ id, success: true, message: result.message });
  //     } catch (err) {
  //       results.push({ id, success: false, message: err.message || 'Failed' });
  //     }
  //   }

  //   return {
  //     success: true,
  //     total: ids.length,
  //     completed: results.filter(r => r.success).length,
  //     failed: results.filter(r => !r.success).length,
  //     details: results,
  //   };
  // }

  async changeTaskStatus(id: string, body: ApproveTaskDto, user: User) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = await queryRunner.manager
        .getRepository(DataCubeTask)
        .findOne({
          where: { id },
          relations: [
            'datacube_frequency.datacube',
            'data_reviewer',
            'data_provider',
            'site',
          ],
        });

      if (!task) {
        throw new BadRequestException('Task not found');
      }

      const updataedstatus = await queryRunner.manager
        .getRepository(DataCubeTask)
        .update(id, {
          status: body.status,
        });

      const updatedTask = await queryRunner.manager
        .getRepository(DataCubeTask)
        .findOne({
          where: { id },
          relations: [
            'datacube_frequency',
            'datacube_frequency.datacube',
            'data_reviewer',
            'data_provider',
            'site',
          ],
        });

      // 1 Check if the frequency is completed
      const totalTasksInFreq = await queryRunner.manager
        .getRepository(DataCubeTask)
        .count({
          where: {
            datacube_frequency: { id: updatedTask.datacube_frequency.id },
          },
        });

      const completedTasksInFreq = await queryRunner.manager
        .getRepository(DataCubeTask)
        .count({
          where: {
            datacube_frequency: { id: updatedTask.datacube_frequency.id },
            status: TaskStatus.COMPLETED,
          },
        });

      if (totalTasksInFreq > 0 && totalTasksInFreq === completedTasksInFreq) {
        await queryRunner.manager
          .getRepository(DataCubeFrequency)
          .update(updatedTask.datacube_frequency.id, {
            status: DataCubeFrequencyStatus.COMPLETED,
          });

        await this.activityService.createTenantActivity(
          ActivityType.DATA_CUBE_FREQUENCY_COMPLETED,
          updatedTask.datacube_frequency.datacube,
          updatedTask,
          user,
          queryRunner,
        );

        // 2 Check if all frequencies in the datacube are completed
        const totalFrequencies = await queryRunner.manager
          .getRepository(DataCubeFrequency)
          .count({
            where: {
              datacube: { id: updatedTask.datacube_frequency.datacube.id },
            },
          });

        const completedFrequencies = await queryRunner.manager
          .getRepository(DataCubeFrequency)
          .count({
            where: {
              datacube: { id: updatedTask.datacube_frequency.datacube.id },
              status: DataCubeFrequencyStatus.COMPLETED,
            },
          });

        if (totalFrequencies > 0 && totalFrequencies === completedFrequencies) {
          await queryRunner.manager
            .getRepository(Datacube)
            .update(updatedTask.datacube_frequency.datacube.id, {
              status: DatacubeStatus.COMPLETED,
            });

          await this.activityService.createTenantActivity(
            ActivityType.DATA_CUBE_COMPLETED,
            updatedTask.datacube_frequency.datacube,
            updatedTask,
            user,
            queryRunner,
          );
        }
      }

      if (updataedstatus.affected > 0 && task.status !== TaskStatus.CREATED) {
        await queryRunner.manager
          .getRepository(DataCubeFrequency)
          .update(task.datacube_frequency.id, {
            status: DataCubeFrequencyStatus.DATA_COLLECTING,
          });

        await queryRunner.manager
          .getRepository(Datacube)
          .update(task.datacube_frequency.datacube.id, {
            status: DatacubeStatus.DATA_COLLECTING,
          });

        const dataReviewer = await queryRunner.manager
          .getRepository(DataCubeTask)
          .find({
            where: { id },
            relations: ['data_reviewer'],
          });
      }
      switch (updatedTask.status) {
        case TaskStatus.SUBMITTED:
          await this.activityService.createTenantActivity(
            ActivityType.TASK_SUBMITTED,
            task.datacube_frequency.datacube,
            task,
            user,
            queryRunner,
          );
          // await this.mailService.send('task-reviewer-notification', {
          //   to: updatedTask.data_reviewer.email,
          //   subject: 'Task Submitted for Your Review on Rubicr',
          //   template: 'task-reviewer-notification',
          //   context: {
          //     data_provider: updatedTask.data_provider,
          //     data_reviewer_name: updatedTask.data_reviewer.name,
          //     data_reviewer_email: updatedTask.data_reviewer.email,
          //     task_name: updatedTask.datacube_frequency.datacube.name,
          //     task: updatedTask,
          //     accountName: user.account.slug,
          //     ownerName: user.name,
          //     site_name: updatedTask.site.name,
          //   },
          // });
          break;
        case TaskStatus.REVIEWING:
          await this.activityService.createTenantActivity(
            ActivityType.TASK_REVIEWING,
            task.datacube_frequency.datacube,
            task,
            user,
            queryRunner,
          );
          // await this.mailService.send('task-reviewed-notification', {
          //   to: updatedTask.data_reviewer.email,
          //   subject: 'Task Reviewing on Rubicr',
          //   template: 'task-reviewed-notification',
          //   context: {
          //     task: updatedTask,
          //     data_provider: updatedTask.data_provider.name,
          //     data_provider_email: updatedTask.data_provider.email,
          //     data_reviewer: updatedTask.data_reviewer.name,
          //     data_reviewer_email: updatedTask.data_reviewer.email,
          //     task_name: updatedTask.datacube_frequency.datacube.name,
          //     accountName: user.account.slug,
          //     ownerName: user.name,
          //     site_name: updatedTask.site.name,
          //   },
          // });
          break;
        case TaskStatus.COMPLETED:
          await this.activityService.createTenantActivity(
            ActivityType.TASK_COMPLETED,
            task.datacube_frequency.datacube,
            task,
            user,
            queryRunner,
          );
          // await this.mailService.send('task-completed-notification', {
          //   to: updatedTask.data_reviewer.email,
          //   subject: 'Task Completed on Rubicr',
          //   template: 'task-completed-notification',
          //   context: {
          //     task: updatedTask,
          //     data_provider: updatedTask.data_provider,
          //     data_provider_email: updatedTask.data_provider.email,
          //     task_name: updatedTask.datacube_frequency.datacube.name,
          //     data_reviewer: updatedTask.data_reviewer.name,
          //     data_reviewer_email: updatedTask.data_reviewer.email,
          //     accountName: user.account.slug,
          //     ownerName: user.name,
          //     site_name: updatedTask.site.name,
          //   },
          // });
          await this.consolidatedResponseService.createConsolidatedResponse(id);
          break;
        case TaskStatus.REJECTED:
          await this.activityService.createTenantActivity(
            ActivityType.TASK_REJECTED,
            task.datacube_frequency.datacube,
            task,
            user,
            queryRunner,
          );
          // await this.mailService.send('task-rejected-notification', {
          //   to: updatedTask.data_provider.email,
          //   subject: 'Task Rejected on Rubicr',
          //   template: 'task-rejected-notification',
          //   context: {
          //     task: updatedTask,
          //     data_provider: updatedTask.data_provider,
          //     data_provider_email: updatedTask.data_provider.email,
          //     task_name: updatedTask.datacube_frequency.datacube.name,
          //     data_reviewer: updatedTask.data_reviewer.name,
          //     data_reviewer_email: updatedTask.data_reviewer.email,
          //     accountName: user.account.slug,
          //     ownerName: user.name,
          //     site_name: updatedTask.site.name,
          //   },
          // });
          break;
        case TaskStatus.REASSIGNED:
          await this.activityService.createTenantActivity(
            ActivityType.TASK_REASSIGNED,
            task.datacube_frequency.datacube,
            task,
            user,
            queryRunner,
          );
          // await this.mailService.send('task-re-assigned-notification', {
          //   to: updatedTask.data_reviewer.email,
          //   subject: 'Task Re-assigned on Rubicr',
          //   template: 'task-re-assigned-notification',
          //   context: {
          //     task: updatedTask,
          //     data_provider: updatedTask.data_provider,
          //     data_provider_email: updatedTask.data_provider.email,
          //     task_name: updatedTask.datacube_frequency.datacube.name,
          //     data_reviewer: updatedTask.data_reviewer.name,
          //     data_reviewer_email: updatedTask.data_reviewer.email,
          //     accountName: user.account.slug,
          //     ownerName: user.name,
          //     site_name: updatedTask.site.name,
          //   },
          // });
          break;
      }
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Task Status updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getTaskQuestionsList(task_id: string, user_id: string) {
    try {
      // Fetch task questions ensuring user has access
      const taskQuestions = await this.taskQuestionModel.find({
        where: [
          { task: { id: task_id } },
          { task: { data_provider: { id: user_id } } },
          { task: { data_reviewer: { id: user_id } } },
        ],
        relations: [
          ...QUESTIONS_RELATIONS,
          'task', // ensure 'task' is included to access template_task_file_url
        ],
      });

      const groupedResults: any = taskQuestions.reduce<Record<string, any>>(
        (acc, curr) => {
          const moduleKey = curr.module_name;
          if (!acc[moduleKey]) {
            acc[moduleKey] = {
              module_name: curr.module_name,
              indicators: {},
              template_task_file_url: curr.task?.template_task_file_url || null, // ✅ include here
            };
          }

          const indicatorKey = curr.indicator_name;
          if (!acc[moduleKey].indicators[indicatorKey]) {
            acc[moduleKey].indicators[indicatorKey] = {
              indicator_name: curr.indicator_name,
              datacube_questions: [],
              datacube_question_sequence: [],
            };
          }

          // handle question type
          if (curr.question_sequence.questable_type === 'GROUP') {
            acc[moduleKey].indicators[indicatorKey].datacube_questions.push(
              curr.question_sequence.group_question_rule
                .datacube_group_questions,
            );
          } else if (curr.question_sequence.questable_type === 'STANDARD') {
            acc[moduleKey].indicators[indicatorKey].datacube_questions.push(
              curr.question_sequence.datacube_question,
            );
          }

          acc[moduleKey].indicators[
            indicatorKey
          ].datacube_question_sequence.push(curr.question_sequence);

          return acc;
        },
        {},
      );

      return groupedResults;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async reviewTaskQuestion(task_id: string, body: ReviewTaskQuestionDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const question of body.questions) {
        const taskQuestion = await queryRunner.manager
          .getRepository(TaskQuestion)
          .findOne({
            where: { id: question.question_id, task: { id: task_id } },
          });

        if (!taskQuestion) {
          throw new BadRequestException('Task question not found');
        }

        await queryRunner.manager
          .getRepository(TaskQuestion)
          .update(taskQuestion.id, {
            is_approved: question.is_approved,
          });
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Task question reviewed successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async uploadFileToTaskAnswers(
    body: BulkUploadDto,
    user: User,
    file: Express.Multer.File,
  ) {
    try {
      // ✅ Upload file FIRST to get the URL
      let fileUrl: string | null = null;
      if (file) {
        const fileUploadResult = await this.uploadFileToTaskQuestionAnswer(
          user,
          file,
        );
        fileUrl = fileUploadResult?.url ?? null;
        // ✅ Set the uploaded file URL in body so createTaskSheetResponse can save it
        body.uploadedFileUrl = fileUrl;
      }

      // Run the bulk answer creation logic (now with uploadedFileUrl set)
      const response = await this.createTaskSheetResponse(body);

      // Check if the sheet response succeeded (handle your own success structure)
      if (!response || response.status !== 'Success') {
        throw new BadRequestException('Bulk answer creation failed');
      }

      // Combine both results into a single unified response
      return {
        status: 'success',
        message: 'Sheet uploaded and answers saved successfully',
        fileUrl,
        data: response?.data ?? null,
      };
    } catch (error) {
      // Centralized error handling
      throw new BadRequestException(
        error?.message || 'Error processing sheet answer upload',
      );
    }
  }

  async uploadFileToTaskQuestionAnswer(user: User, file: any) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // ✅ Use same bucket and path structure as yearly exports
      const s3 = this.awsS3Config.getS3();
      const fileKey = `excel_exports/${uuidv4()}-${file.originalname || file.filename}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET, // Same bucket as yearly exports
        Key: fileKey,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType:
          file.mimetype ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await s3.send(command);

      // ✅ Use same URL structure as yearly exports
      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/dev/rubicr/${fileKey}`;

      return {
        success: true,
        url: fileUrl,
      };
    } catch (error) {
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  async uploadsheetAnswers(user: User, file: any) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const file_path = await this.fileService.uploadFile(
        user.account.id,
        file,
      );

      return {
        success: true,
        url: file_path,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error uploading file');
    }
  }

  async getTaskByUser(user: IUser, param?: any) {
    try {
      const { page, limit, skip, sort, filter } = param;
      let searchQuery = {};
      let siteQuery = {};
      let taskStatusQuery = {};
      if (filter.search) {
        searchQuery = {
          task_questions: {
            question_sequence: {
              public_module_name: ILike(`%${filter.search}%`),
            },
          },
        };
      }
      if (filter.site_name) {
        siteQuery = {
          site: {
            name: ILike(`%${filter.site_name}%`),
          },
        };
      }

      if (filter.task_status) {
        taskStatusQuery = {
          status: ILike(`%${filter.task_status}%`),
        };
      }
      const query = this.buildTaskQuery(user);
      query.where = {
        ...query.where,
        ...searchQuery,
        ...siteQuery,
        ...taskStatusQuery,
      };
      const [tasks, totalcount] = await this.dataCubeTaskModel.findAndCount({
        ...query,
        take: limit,
        skip,
        order: sort,
      });

      return {
        success: true,
        task: tasks,
        meta: {
          currentCount: tasks.length,
          currentPage: page,
          currentLimit: limit,
          totalcount,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch tasks for user ${user.id}: ${error.message}`,
      );
    }
  }

  async createGroupQuestion(id, body: GroupQuestionDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const taskQuestion = await queryRunner.manager
        .getRepository(TaskQuestion)
        .findOne({
          where: { task: { id } },
        });

      if (!taskQuestion) {
        throw new BadRequestException('Task question not found');
      }

      const groupQuestion = await queryRunner.manager
        .getRepository(TaskQuestion)
        .create({
          task: { id },
          question_sequence: { id: body.question_sequence },
          is_answered: false,
          site: taskQuestion.site,
          datacube_frequency: taskQuestion.datacube_frequency,
          universal_question_id: taskQuestion.universal_question_id,
        });

      await queryRunner.manager.getRepository(TaskQuestion).save(groupQuestion);

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Group question created successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteGroupQuestion(id: string, body: DeleteGroupQuestionDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const taskQuestion = await queryRunner.manager
        .getRepository(TaskQuestion)
        .findOne({
          where: { id: body.task_question_id, task: { id } },
        });
      if (!taskQuestion) {
        throw new BadRequestException('Task question not found');
      }
      await queryRunner.manager.getRepository(TaskQuestionAnswer).delete({
        task_question: { id: taskQuestion.id },
      });
      await queryRunner.manager
        .getRepository(TaskQuestion)
        .delete(taskQuestion.id);
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Group question deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getSignedUrl(url: string) {}

  async getTasksByBusinessUnit(
    user: IUser,
    status?: string,
    datacube_name?: string,
  ) {
    try {
      const query = this.buildTaskQuery(user);

      // Build base where condition with datacube_name filter only
      let datacubeNameQuery = {};
      if (datacube_name && datacube_name.trim() !== '') {
        datacubeNameQuery = {
          datacube_frequency: {
            datacube: {
              name: ILike(`%${datacube_name}%`),
            },
          },
        };
      }

      const baseWhereCondition = {
        ...query.where,
        ...datacubeNameQuery,
      };

      // Fetch ALL tasks for accurate module counting (regardless of status filter)
      const allTasks = await this.dataCubeTaskModel.find({
        relations: [
          'business_unit',
          'site',
          'datacube_frequency',
          'datacube_frequency.datacube',
          'task_questions',
          'task_questions.question_sequence',
        ],
        where: baseWhereCondition,
      });

      // Group by business unit with module information using ALL tasks
      const groupedByBusinessUnit = allTasks.reduce((acc, task) => {
        const businessUnitId = task.business_unit?.id;
        const businessUnitName = task.business_unit?.name;
        const siteId = task.site?.id;
        const moduleName =
          task.task_questions?.[0]?.question_sequence?.public_module_name;
        const frequency = task.datacube_frequency?.datacube?.frequency;
        const frequencyName = task.datacube_frequency?.frequency_name;
        const isCompleted = task.status?.toLowerCase() === 'completed';

        if (!businessUnitId || !siteId) return acc;

        // Initialize business unit if not exists
        if (!acc[businessUnitId]) {
          acc[businessUnitId] = {
            business_unit_id: businessUnitId,
            business_unit_name: businessUnitName,
            sites: [],
            total_tasks: 0,
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
            task_count: 0,
            modules: {}, // Store module tracking data
            total_module_count: 0,
            completed_module_count: 0,
          };
          acc[businessUnitId].sites.push(existingSite);
        }

        // Track modules and their completion by frequency_name
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

      // Calculate module counts for each site (based on ALL tasks) - DO THIS FIRST
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

          delete site.modules;
        });
      });

      // Now apply status filter and count only filtered tasks
      let filteredTasks = allTasks;
      if (status && status.trim() !== '') {
        filteredTasks = allTasks.filter((task) =>
          task.status?.toLowerCase().includes(status.toLowerCase()),
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

      const formattedData = Object.values(groupedByBusinessUnit);

      return {
        success: true,
        data: formattedData,
        total_business_units: formattedData.length,
        total_tasks: filteredTasks.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch tasks by business unit for user ${user.id}: ${error.message}`,
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

  async getTasksBySiteId(
    site_id: string,
    user: IUser,
    status?: string,
    datacube_name?: string,
  ) {
    try {
      // Build base query with user role restrictions
      const query = this.buildTaskQuery(user);

      // Build optional status filter
      let taskStatusQuery = {};
      if (status && status.trim() !== '') {
        taskStatusQuery = {
          status: ILike(`%${status}%`),
        };
      }

      // Build optional datacube name filter
      let datacubeNameQuery = {};
      if (datacube_name && datacube_name.trim() !== '') {
        datacubeNameQuery = {
          datacube_frequency: {
            datacube: {
              name: ILike(`%${datacube_name}%`),
            },
          },
        };
      }

      // Build where condition
      const whereCondition = {
        ...query.where,
        site: { id: site_id },
        is_deleted: false,
        ...taskStatusQuery,
        ...datacubeNameQuery,
      };

      // Fetch tasks for the specific site
      const tasks = await this.dataCubeTaskModel.find({
        where: whereCondition,
        relations: [
          'datacube_frequency',
          'datacube_frequency.datacube',
          'site',
          'data_provider',
          'data_reviewer',
          'task_questions',
          'task_questions.question_sequence',
        ],
      });

      if (!tasks || tasks.length === 0) {
        return {
          success: true,
          message: 'No tasks found for this site',
          data: [],
          total: 0,
          site_id,
        };
      }

      // Format the response data
      const formattedTasks = tasks.map((task) => {
        // Get the first module name (single module per task)
        const moduleName =
          task.task_questions?.[0]?.question_sequence?.public_module_name ||
          null;

        const moduleId =
          task.task_questions?.[0]?.question_sequence?.public_module_id || null;

        return {
          task_id: task.id,
          task_status: task.status,
          datacube_id: task.datacube_frequency?.datacube?.id || null,
          datacube_name: task.datacube_frequency?.datacube?.name || null,
          frequency: task.datacube_frequency?.datacube?.frequency || null,
          frequency_name: task.datacube_frequency?.frequency_name || null,
          template_yearly_file_url: task.template_yearly_file_url || null,
          uploaded_yearly_file_url: task.uploaded_yearly_file_url || null,
          // template_yearly_file_url: null,
          site_id: task.site?.id || null,
          site_name: task.site?.name || null,
          module_id: moduleId,
          module_name: moduleName,
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
        site_id,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch tasks for site ${site_id}: ${error.message}`,
      );
    }
  }
}
