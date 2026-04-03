import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { EntriesService } from './entries.service';
import { toPublicEntry } from './entry.types';

@Controller('entries')
@UseGuards(AuthGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  async createEntry(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEntryDto) {
    const entry = await this.entriesService.createEntry(user.userId, dto);

    return toPublicEntry(entry);
  }

  @Get()
  async listEntries(@CurrentUser() user: AuthenticatedUser, @Query('query') query?: string) {
    const entries = await this.entriesService.listEntries(user.userId, query);

    return entries.map(toPublicEntry);
  }

  @Get(':entryId')
  async getEntry(@CurrentUser() user: AuthenticatedUser, @Param('entryId') entryId: string) {
    const entry = await this.entriesService.findEntryById(user.userId, entryId);

    return toPublicEntry(entry);
  }

  @Patch(':entryId')
  async updateEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateEntryDto,
  ) {
    const entry = await this.entriesService.updateEntry(user.userId, entryId, dto);

    return toPublicEntry(entry);
  }

  @Delete(':entryId')
  async deleteEntry(@CurrentUser() user: AuthenticatedUser, @Param('entryId') entryId: string) {
    await this.entriesService.deleteEntry(user.userId, entryId);

    return {
      success: true,
    };
  }
}
