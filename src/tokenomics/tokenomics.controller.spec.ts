import { Test, TestingModule } from '@nestjs/testing';
import { TokenomicsController } from './tokenomics.controller';

describe('TokenomicsController', () => {
  let controller: TokenomicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenomicsController],
    }).compile();

    controller = module.get<TokenomicsController>(TokenomicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
