import { PartialType } from '@nestjs/swagger';
import { CreateTaskItemDto } from './create-tournament-tasks.dto';

/** Усі поля опційні; сервіс вимагає хоча б одне поле. */
export class UpdateTaskDto extends PartialType(CreateTaskItemDto) {}
