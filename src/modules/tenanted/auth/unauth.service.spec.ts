
import { MasterAccount } from 'src/modules/admin/admin-accounts/admin-account.entity';
import { AppDataSource } from '../../../orm_config/public.datasource';
import { UnAuthService } from './unauth.service';
import { BadRequestException } from '@nestjs/common';

jest.mock('../../../orm_config/public.datasource');

describe('signUp Service', () => {
  let unauthService: UnAuthService;
  let mockCreateQueryRunner: jest.Mock;
  let mockQueryRunner: any;
  let mockGetTenantConnection: jest.Mock;

  beforeEach(() => {
    unauthService = new UnAuthService();
    mockCreateQueryRunner = jest.fn();
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn(),
        save: jest.fn(),
      },
    };

    mockCreateQueryRunner.mockResolvedValue(mockQueryRunner);
    AppDataSource.initialize = jest.fn().mockResolvedValue({
      createQueryRunner: mockCreateQueryRunner,
    });

    mockGetTenantConnection = jest.fn().mockResolvedValue({
      runMigrations: jest.fn(),
      createQueryRunner: jest.fn().mockResolvedValue(mockQueryRunner),
      destroy: jest.fn(),
    });

    global.getTenantConnection = mockGetTenantConnection;
  });

  it('Should successfully create an account', async () => {

    mockQueryRunner.manager.getRepository = jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(new MasterAccount()),
    });

    const payload = {
      name: 'Test Account',
      account_name: 'Test Company',
      email: 'test@example.com',
      slug: 'test-org',
      password: 'Password123',
    };

    const result = await unauthService.signUp(payload);

    expect(result).toEqual({
      success: true,
      message: 'Account created successfully',
    });

    expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
  });
});
