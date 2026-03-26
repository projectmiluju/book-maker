import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import type { DraftStatus } from '../draft.types';
import { DRAFT_STATUSES } from '../draft.types';

export class CreateDraftDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(DRAFT_STATUSES)
  status?: DraftStatus;
}
