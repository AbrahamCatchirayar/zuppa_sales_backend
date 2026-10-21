/* eslint-disable max-classes-per-file, @typescript-eslint/no-explicit-any */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Brand' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'brand' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'The manufacturing brand or series' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Core Platform (Core)' })
  @IsOptional()
  @IsString()
  parentBranch?: string;
}

export class CreateOptionCodeDto {
  @ApiProperty({ example: 'EZFly' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'EZF' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class CreateConfiguredProductDto {
  @ApiProperty({ example: 'ZUP-EZF-HWK-R0-55' })
  @IsNotEmpty()
  @IsString()
  productCode: string;

  @ApiProperty({ example: 'R0' })
  @IsNotEmpty()
  @IsString()
  revisionNumber: string;

  @ApiPropertyOptional({ example: '2026-10-14' })
  @IsOptional()
  @IsString()
  revisionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ example: 'PUBLISHED' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateConfiguredProductDto {
  @ApiPropertyOptional({ example: 'ZUP-EZF-HWK-R0-1' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ example: 'R0' })
  @IsOptional()
  @IsString()
  revisionNumber?: string;

  @ApiPropertyOptional({ example: '2026-10-14' })
  @IsOptional()
  @IsString()
  revisionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ example: 'PUBLISHED' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateJobOrderDto {
  @ApiProperty({ example: 'WO-2026-7200' })
  @IsNotEmpty()
  @IsString()
  workOrderNo: string;

  @ApiPropertyOptional({ example: 'PO-773019' })
  @IsOptional()
  @IsString()
  purchaseOrderNumber?: string;

  @ApiPropertyOptional({ example: '2026-10-16' })
  @IsOptional()
  @IsString()
  dateOfRequest?: string;

  @ApiPropertyOptional({ example: 'Sales Team / Operator' })
  @IsOptional()
  @IsString()
  requestedBy?: string;

  @ApiProperty({ example: 'AeroSpace Solutions Ltd' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiPropertyOptional({ example: 'Robert Chen' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ example: '+1 (555) 019-2831' })
  @IsOptional()
  @IsString()
  contactMobile?: string;

  @ApiPropertyOptional({ example: 'ops@aerospace.com' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '100 Innovation Way, Suite 400, Boston MA' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({ example: '2026-10-25' })
  @IsOptional()
  @IsString()
  targetDeliveryDate?: string;

  @ApiPropertyOptional({ example: '2026-10-28' })
  @IsOptional()
  @IsString()
  actualDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'Pending' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ example: 'New' })
  @IsOptional()
  @IsString()
  orderType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfAttachmentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  productsIncluded?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  milestones?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  addons?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ example: 'Engineering Review' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '1/1 ITEM' })
  @IsOptional()
  @IsString()
  statusItemCount?: string;
}

export class UpdateJobOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workOrderNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchaseOrderNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateOfRequest?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requestedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactMobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actualDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfAttachmentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  productsIncluded?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  milestones?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  addons?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusItemCount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  scheduleSpec?: Record<string, any>;
}

export class UpdateScheduleSpecDto {
  @ApiProperty()
  @IsNotEmpty()
  scheduleSpec: Record<string, any>;
}

