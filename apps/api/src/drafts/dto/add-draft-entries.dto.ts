import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AddDraftEntriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  entryIds!: string[];
}
