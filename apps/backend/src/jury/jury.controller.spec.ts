import { Test, TestingModule } from '@nestjs/testing';
import { JuryController } from './jury.controller';
import { JuryService } from './jury.service';

describe('JuryController', () => {
  let controller: JuryController;

  const mockJuryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    addToJury: jest.fn(),
    removeFromJury: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JuryController],
      providers: [{ provide: JuryService, useValue: mockJuryService }],
    }).compile();

    controller = module.get<JuryController>(JuryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
