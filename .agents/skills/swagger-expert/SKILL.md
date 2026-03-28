---
name: swagger-expert
description: >-
  NestJS + Swagger (@nestjs/swagger) expert for documenting controllers, DTOs,
  auth headers, and response schemas. Knows this project's conventions: examples
  files in src/examples/, DocumentBuilder in main.ts, ApiTags/ApiOperation/
  ApiResponse/ApiBody/ApiBearerAuth decorators, and FindQueryDto pagination.
  Use when adding or fixing Swagger decorators, documenting a new endpoint,
  updating OpenAPI examples, or configuring the DocumentBuilder setup in main.ts.
category: framework
risk: low
source: project
date_added: "2026-03-24"
---

# Swagger Expert

You are an expert in documenting NestJS APIs with `@nestjs/swagger` (OpenAPI 3).

## Project Conventions

### Swagger Bootstrap (`apps/backend/src/main.ts`)
```typescript
const config = new DocumentBuilder()
  .setTitle('StarOfUkraine API')
  .setDescription('...')
  .setVersion('1.0')
  .addBearerAuth()        // enables JWT lock icon on secured routes
  .build();

SwaggerModule.setup('api/docs', app, document);
```

### Examples Pattern
Concrete request/response shapes live in `src/examples/<domain>/<domain>.examples.ts` and are imported into controllers:

```typescript
// src/examples/team/team.examples.ts
export const teamExamples = {
  createRequest: { teamName: '...', ... },
  response:      { id: '...', teamName: '...', createdAt: '...' },
} as const;
```

Reference them in `@ApiBody` / `@ApiResponse`:
```typescript
@ApiBody({ type: CreateTeamDto, examples: { create: { value: teamExamples.createRequest } } })
@ApiResponse({ status: 201, schema: { example: teamExamples.response } })
```

### Standard Controller Decorators
Apply in this order on the controller class:

```typescript
@Public()                       // if unauthenticated access is allowed
@ApiTags('Teams')               // groups in Swagger UI
@Controller('teams')
export class TeamController { ... }
```

On each route handler:
```typescript
@Get()
@ApiOperation({ summary: 'Short action description' })
@ApiResponse({ status: 200, description: 'Human-readable outcome' })
findAll(@Query() query: FindQueryDto) { ... }
```

For routes that require JWT (non-`@Public()`):
```typescript
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

### DTOs — Documenting with `@ApiProperty`
Always add `@ApiProperty` to every DTO field so Swagger generates a schema:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Star of Ukraine' })
  @IsString()
  teamName: string;

  @ApiPropertyOptional({ example: '@starofukraine' })
  @IsOptional()
  @IsString()
  telegram?: string;
}
```

Use `@ApiPropertyOptional` (shorthand for `required: false`) for optional fields.

### Pagination DTO (`FindQueryDto`)
`src/common/dto/find-query.dto.ts` is shared across modules:

```typescript
@ApiPropertyOptional({ example: 1, description: 'Page number (1-based)' })
@IsOptional()
@IsNumber()
page?: number;

@ApiPropertyOptional({ example: 10, description: 'Items per page (defaults to PAGE_SIZE env var)' })
@IsOptional()
@IsNumber()
limit?: number;
```

---

## Common Tasks

### Adding a new module's docs
1. Create `src/examples/<module>/<module>.examples.ts` with `createRequest` and `response` shapes.
2. Add `@ApiTags`, `@ApiOperation`, `@ApiBody`, `@ApiResponse` to the controller.
3. Add `@ApiProperty` / `@ApiPropertyOptional` to all DTO fields.
4. Protect secured routes with `@ApiBearerAuth()`.

### Documenting error responses
```typescript
@ApiResponse({ status: 400, description: 'Validation failed' })
@ApiResponse({ status: 404, description: 'Resource not found' })
@ApiResponse({ status: 409, description: 'Resource already exists' })
```

### Enum properties
```typescript
@ApiProperty({ enum: TournamentStatus, example: TournamentStatus.UPCOMING })
@IsEnum(TournamentStatus)
status: TournamentStatus;
```

### Array properties
```typescript
@ApiProperty({ type: [String], example: ['Alice', 'Bob'] })
@IsArray()
@IsString({ each: true })
members: string[];
```

---

## Checklist

- [ ] `@ApiTags` on every controller
- [ ] `@ApiOperation` + `@ApiResponse` on every route handler
- [ ] `@ApiBody` with `examples` on POST/PATCH handlers
- [ ] `@ApiBearerAuth` + `@ApiResponse({ status: 401 })` on authenticated routes
- [ ] `@ApiProperty` / `@ApiPropertyOptional` on every DTO field
- [ ] Examples file exists in `src/examples/<domain>/`
- [ ] No hardcoded example values in decorators — always import from the examples file

## External Resources
- [NestJS OpenAPI docs](https://docs.nestjs.com/openapi/introduction)
- [@nestjs/swagger API reference](https://github.com/nestjs/swagger)
