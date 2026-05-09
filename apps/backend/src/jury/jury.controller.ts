import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JuryService } from './jury.service';
import { AddToJuryDto } from './dto';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { Role } from 'src/enum';
import { authExamples, juryExamples } from '../examples';

@Roles(Role.JURY, Role.ADMIN)
@ApiTags('Jury')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('jury')
export class JuryController {
  constructor(private readonly juryService: JuryService) {}

  @Get()
  @ApiOperation({ summary: 'List all jury profiles' })
  @ApiResponse({ status: 200, description: 'Jury profiles returned' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — insufficient role (JURY or ADMIN)',
  })
  findAll() {
    return this.juryService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Jury ID' })
  @ApiOperation({ summary: 'Get a jury profile by id' })
  @ApiResponse({
    status: 200,
    description: 'Jury profile returned',
    schema: { example: juryExamples.juryResponse },
  })
  @ApiResponse({ status: 404, description: 'Jury not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — insufficient role (JURY or ADMIN)',
  })
  findOne(@Param('id') id: string) {
    return this.juryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a user to jury for a tournament' })
  @ApiBody({
    type: AddToJuryDto,
    examples: {
      add: { value: juryExamples.addToJuryRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Jury created/updated and connected to tournament',
    schema: { example: juryExamples.juryResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — insufficient role (JURY or ADMIN)',
  })
  addToJury(@Body() body: AddToJuryDto) {
    return this.juryService.addToJury(body);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Jury ID' })
  @ApiOperation({ summary: 'Remove a jury profile' })
  @ApiResponse({
    status: 200,
    description: 'Jury removed',
    schema: { example: juryExamples.removeResponse },
  })
  @ApiResponse({ status: 404, description: 'Jury not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden — insufficient role (JURY or ADMIN), or not allowed to remove this jury profile',
  })
  removeFromJury(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.juryService.removeFromJury(id, userId);
  }
}
