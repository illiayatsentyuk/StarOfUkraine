import { Controller } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

/** Reserved; email sending is used internally (e.g. password reset). */
@ApiExcludeController()
@Controller('email')
export class EmailController {}
