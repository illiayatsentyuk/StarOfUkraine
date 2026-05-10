import { PartialType } from '@nestjs/swagger';
import { CreateTaskItemDto } from './create-tournament-tasks.dto';

export class UpdateTaskDto extends PartialType(CreateTaskItemDto) {}
