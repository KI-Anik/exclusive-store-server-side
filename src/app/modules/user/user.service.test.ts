import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errorHelpers/AppError';
import { sendWelcomeEmail } from '../../nodemailer/sendWelcomeEmail';
import { IsActive, IUser, Role } from './user.interface';
import { User } from './user.model';
import { UserService } from './user.service';

// Mock dependencies
jest.mock('./user.model');
jest.mock('bcryptjs');
jest.mock('../../nodemailer/sendWelcomeEmail');

const UserMock = User as jest.Mocked<typeof User>;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const sendWelcomeEmailMock = sendWelcomeEmail as jest.MockedFunction<
  typeof sendWelcomeEmail
>;

describe('UserServices', () => {
  const mockUser: IUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: Role.USER,
    isActive: IsActive.ACTIVE,
    isDeleted: false,
    auths: [{ provider: 'credentials', providerId: 'test@example.com' }],
  };

  const mockAdminToken: JwtPayload = {
    userId: 'admin-id',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for createUser
  describe('createUser', () => {
    it('should create a user successfully and send a welcome email', async () => {
      (UserMock.findOne as jest.Mock).mockResolvedValue(null);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (UserMock.create as jest.Mock).mockResolvedValue(mockUser);
      sendWelcomeEmailMock.mockResolvedValue();

      const result = await UserService.createUser({
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(UserMock.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(bcryptMock.hash).toHaveBeenCalledWith(
        mockUser.password,
        expect.any(Number),
      );
      expect(UserMock.create).toHaveBeenCalled();
      expect(sendWelcomeEmailMock).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw a BAD_REQUEST error if user already exists', async () => {
      (UserMock.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(UserService.createUser(mockUser)).rejects.toThrow(
        new AppError(httpStatus.BAD_REQUEST, 'User already exist'),
      );
    });
  });

  // Test suite for updateUser
  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const updatePayload = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updatePayload };

      // Ensure the user is found for this specific test
      (UserMock.findById as jest.Mock).mockResolvedValue(mockUser);
      (UserMock.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const result = await UserService.updateUser(
        'user-id',
        updatePayload,
        mockAdminToken,
      );

      expect(UserMock.findById).toHaveBeenCalledWith('user-id');
      expect(UserMock.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id',
        updatePayload,
        { new: true, runValidators: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw a NOT_FOUND error if user does not exist', async () => {
      (UserMock.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.updateUser('non-existent-id', {}, mockAdminToken),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'user not found'));
    });

    it('should throw a FORBIDDEN error if a USER tries to change a role', async () => {
      const userToken: JwtPayload = { role: Role.USER };
      (UserMock.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        UserService.updateUser('user-id', { role: Role.ADMIN }, userToken),
      ).rejects.toThrow(
        new AppError(httpStatus.FORBIDDEN, 'you are not authorized'),
      );
    });

    it('should throw a FORBIDDEN error if an ADMIN tries to set SUPER_ADMIN role', async () => {
      (UserMock.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        UserService.updateUser(
          'user-id',
          { role: Role.SUPER_ADMIN },
          mockAdminToken,
        ),
      ).rejects.toThrow(
        new AppError(httpStatus.FORBIDDEN, 'you are not permitted'),
      );
    });

    it('should hash password if it is being updated', async () => {
      const originalPassword = 'newPassword123';
      const updatePayload = { password: originalPassword };
      (UserMock.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (UserMock.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
      });

      await UserService.updateUser('user-id', updatePayload, mockAdminToken);

      expect(bcryptMock.hash).toHaveBeenCalledWith(
        originalPassword, // Use the original, un-mutated password for the assertion
        expect.any(Number),
      );
      expect(UserMock.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id',
        expect.objectContaining({ password: 'newHashedPassword' }),
        expect.any(Object),
      );
    });
  });

  // Test suite for getAllUsers
  describe('getAllUsers', () => {
    it('should retrieve all users with metadata', async () => {
      const users = [mockUser];
      (UserMock.find as jest.Mock).mockResolvedValue(users);
      (UserMock.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await UserService.getAllUsers();

      expect(UserMock.find).toHaveBeenCalledWith({});
      expect(UserMock.countDocuments).toHaveBeenCalled();
      expect(result.data).toEqual(users);
      expect(result.meta.total).toBe(1);
    });
  });
});