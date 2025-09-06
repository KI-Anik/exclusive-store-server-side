import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errorHelpers/AppError';
import {
  createNewAccessTokenWithRefreshToken,
  createUserToken,
} from '../../utils/userTokens';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { AuthServices } from './auth.service';

// Mock dependencies
jest.mock('../user/user.model');
jest.mock('bcryptjs');
jest.mock('../../utils/userTokens');

const UserMock = User as jest.Mocked<typeof User>;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const createUserTokenMock = createUserToken as jest.MockedFunction<
  typeof createUserToken
>;
const createNewAccessTokenWithRefreshTokenMock =
  createNewAccessTokenWithRefreshToken as jest.MockedFunction<
    typeof createNewAccessTokenWithRefreshToken
  >;

describe('AuthServices', () => {
  const mockUser: Partial<IUser> & { password?: string } = {
    _id: 'user-id' as any,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const mockTokens = {
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for credentialsLogin
  describe('credentialsLogin', () => {
    it('should login a user successfully and return tokens', async () => {
      // The service calls `.toObject()` on the Mongoose document.
      // We mock this behavior to ensure our test is accurate.
      const mockMongooseUser = {
        ...mockUser,
        toObject: () => ({ ...mockUser }),
      };
      const selectMock = jest.fn().mockResolvedValue(mockMongooseUser);
      (UserMock.findOne as jest.Mock).mockReturnValue({ select: selectMock });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      createUserTokenMock.mockReturnValue(mockTokens);

      const result = await AuthServices.credentialsLogin({
        email: mockUser.email,
        password: 'password123',
      });

      expect(UserMock.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(selectMock).toHaveBeenCalledWith('+password');
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
      expect(createUserTokenMock).toHaveBeenCalledWith(mockMongooseUser);

      const expectedUserObject = { ...mockUser };
      delete expectedUserObject.password;

      expect(result).toEqual({ user: expectedUserObject, ...mockTokens });
    });

    it('should throw NOT_FOUND error if email does not exist', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      (UserMock.findOne as jest.Mock).mockReturnValue({ select: selectMock });

      await expect(
        AuthServices.credentialsLogin({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, "Email doesn't exist"),
      );
    });

    it('should throw FORBIDDEN error if user has no password (social login)', async () => {
      const userWithoutPassword = { ...mockUser, password: '' };
      const selectMock = jest.fn().mockResolvedValue(userWithoutPassword);
      (UserMock.findOne as jest.Mock).mockReturnValue({ select: selectMock });

      await expect(
        AuthServices.credentialsLogin({
          email: mockUser.email,
          password: 'password123',
        }),
      ).rejects.toThrow(
        new AppError(httpStatus.FORBIDDEN, 'DB - password not found'),
      );
    });

    it('should throw FORBIDDEN error for incorrect password', async () => {
      const selectMock = jest.fn().mockResolvedValue(mockUser);
      (UserMock.findOne as jest.Mock).mockReturnValue({ select: selectMock });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthServices.credentialsLogin({
          email: mockUser.email,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(new AppError(httpStatus.FORBIDDEN, 'Incorrect password'));
    });
  });

  // Test suite for getNewAccessToken
  describe('getNewAccessToken', () => {
    it('should return a new access token', async () => {
      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;

      // The service returns a Mongoose document. To satisfy TypeScript's type checking,
      // our mock should resemble one. Adding a `toObject` method is a simple way to do this.
      const mockMongooseUser = {
        ...userWithoutPassword,
        toObject: () => userWithoutPassword,
      };

      const mockRefreshResponse = {
        accessToken: 'newMockAccessToken',
        user: mockMongooseUser,
      };
      createNewAccessTokenWithRefreshTokenMock.mockResolvedValue(
        mockRefreshResponse,
      );

      const result = await AuthServices.getNewAccessToken('mockRefreshToken');

      expect(createNewAccessTokenWithRefreshTokenMock).toHaveBeenCalledWith(
        'mockRefreshToken',
      );
      expect(result).toEqual(mockRefreshResponse);
    });
  });

  // Test suite for resetPassword
  describe('resetPassword', () => {
    const mockDecodedToken: JwtPayload = { userId: 'user-id' };
    const saveMock = jest.fn().mockResolvedValue(true);
    const userWithPassword = { ...mockUser, save: saveMock };

    it('should reset password successfully', async () => {
      const selectMock = jest.fn().mockResolvedValue(userWithPassword);
      (UserMock.findById as jest.Mock).mockReturnValue({ select: selectMock });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await AuthServices.resetPassword(
        'oldPassword',
        'newPassword',
        mockDecodedToken,
      );

      expect(UserMock.findById).toHaveBeenCalledWith(mockDecodedToken.userId);
      expect(selectMock).toHaveBeenCalledWith('+password');
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        'oldPassword',
        mockUser.password!,
      );
      expect(bcryptMock.hash).toHaveBeenCalledWith(
        'newPassword',
        expect.any(Number),
      );
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if user is not found', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      (UserMock.findById as jest.Mock).mockReturnValue({ select: selectMock });

      await expect(
        AuthServices.resetPassword(
          'oldPassword',
          'newPassword',
          mockDecodedToken,
        ),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    });

    it('should throw BAD_REQUEST if password is not set for the account', async () => {
      const userWithoutPassword = { ...mockUser, password: '', save: saveMock };
      const selectMock = jest.fn().mockResolvedValue(userWithoutPassword);
      (UserMock.findById as jest.Mock).mockReturnValue({ select: selectMock });

      await expect(
        AuthServices.resetPassword(
          'oldPassword',
          'newPassword',
          mockDecodedToken,
        ),
      ).rejects.toThrow(
        new AppError(
          httpStatus.BAD_REQUEST,
          'Password not set for this account. Cannot reset password.',
        ),
      );
    });

    it("should throw UNAUTHORIZED if old password doesn't match", async () => {
      const selectMock = jest.fn().mockResolvedValue(userWithPassword);
      (UserMock.findById as jest.Mock).mockReturnValue({ select: selectMock });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthServices.resetPassword(
          'wrongOldPassword',
          'newPassword',
          mockDecodedToken,
        ),
      ).rejects.toThrow(
        new AppError(httpStatus.UNAUTHORIZED, "Old password doesn't match"),
      );
    });

    it('should throw CONFLICT if new password is the same as the old one', async () => {
      const selectMock = jest.fn().mockResolvedValue(userWithPassword);
      (UserMock.findById as jest.Mock).mockReturnValue({ select: selectMock });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        AuthServices.resetPassword(
          'oldPassword',
          'oldPassword',
          mockDecodedToken,
        ),
      ).rejects.toThrow(
        new AppError(
          httpStatus.CONFLICT,
          'New password cannot be the same as the old password',
        ),
      );
    });
  });
});