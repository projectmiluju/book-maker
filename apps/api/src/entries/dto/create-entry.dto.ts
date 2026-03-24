import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import type { EntryStatus } from '../entry.types';
import { ENTRY_STATUSES } from '../entry.types';

export class CreateEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsIn(ENTRY_STATUSES)
  status?: EntryStatus;
}
