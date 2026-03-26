import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { toPublicDraft, toPublicDraftDetail } from './draft.types';
import { DraftsService } from './drafts.service';
import { AddDraftEntriesDto } from './dto/add-draft-entries.dto';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';

@Controller('drafts')
@UseGuards(AuthGuard)
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Post()
  async createDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDraftDto,
  ) {
    const draft = await this.draftsService.createDraft(user.userId, dto);

    return toPublicDraft(draft);
  }

  @Get()
  async listDrafts(@CurrentUser() user: AuthenticatedUser) {
    const drafts = await this.draftsService.listDrafts(user.userId);

    return drafts.map(toPublicDraft);
  }

  @Get(':draftId')
  async getDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Param('draftId') draftId: string,
  ) {
    const draft = await this.draftsService.findDraftById(user.userId, draftId);

    return toPublicDraftDetail(draft);
  }

  @Patch(':draftId')
  async updateDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Param('draftId') draftId: string,
    @Body() dto: UpdateDraftDto,
  ) {
    const draft = await this.draftsService.updateDraft(user.userId, draftId, dto);

    return toPublicDraft(draft);
  }

  @Post(':draftId/entries')
  async addEntriesToDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Param('draftId') draftId: string,
    @Body() dto: AddDraftEntriesDto,
  ) {
    const draft = await this.draftsService.addEntriesToDraft(
      user.userId,
      draftId,
      dto.entryIds,
    );

    return toPublicDraftDetail(draft);
  }
}
