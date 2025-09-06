"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const sendWelcomeEmail_1 = require("../../nodemailer/sendWelcomeEmail");
const user_interface_1 = require("./user.interface");
const userTokens_1 = require("../../utils/userTokens");
const user_model_1 = require("./user.model");
const user_service_1 = require("./user.service");
// Mock dependencies
jest.mock('./user.model');
jest.mock('bcryptjs');
jest.mock('../../nodemailer/sendWelcomeEmail');
jest.mock('../../utils/userTokens');
const UserMock = user_model_1.User;
const bcryptMock = bcryptjs_1.default;
const sendWelcomeEmailMock = sendWelcomeEmail_1.sendWelcomeEmail;
const createUserTokenMock = userTokens_1.createUserToken;
describe('UserServices', () => {
    const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: user_interface_1.Role.USER,
        isActive: user_interface_1.IsActive.ACTIVE,
        isDeleted: false,
        auths: [{ provider: 'credentials', providerId: 'test@example.com' }],
    };
    const mockAdminToken = {
        userId: 'admin-id',
        email: 'admin@example.com',
        role: user_interface_1.Role.ADMIN,
    };
    afterEach(() => {
        jest.clearAllMocks();
    });
    // Test suite for createUser
    describe('createUser', () => {
        it('should create a user, generate tokens for auto-login, and send a welcome email', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockTokens = {
                accessToken: 'mockAccessToken',
                refreshToken: 'mockRefreshToken',
            };
            const userPayload = {
                name: mockUser.name,
                email: mockUser.email,
                password: mockUser.password,
            };
            // Mock the Mongoose document methods that are used in the service
            const mockMongooseUser = Object.assign(Object.assign({}, mockUser), { toObject: () => (Object.assign({}, mockUser)) });
            UserMock.findOne.mockResolvedValue(null);
            bcryptMock.hash.mockResolvedValue('hashedPassword');
            UserMock.create.mockResolvedValue(mockMongooseUser);
            sendWelcomeEmailMock.mockResolvedValue();
            createUserTokenMock.mockReturnValue(mockTokens);
            // Act
            const result = yield user_service_1.UserService.createUser(userPayload);
            // Assert
            expect(UserMock.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(bcryptMock.hash).toHaveBeenCalledWith(mockUser.password, expect.any(Number));
            expect(UserMock.create).toHaveBeenCalled();
            expect(createUserTokenMock).toHaveBeenCalledWith(mockMongooseUser);
            expect(sendWelcomeEmailMock).toHaveBeenCalledWith(mockUser.email, mockUser.name);
            // The service deletes the password from the user object before returning
            const expectedUserObject = Object.assign({}, mockUser);
            delete expectedUserObject.password;
            expect(result).toEqual({
                user: expectedUserObject,
                accessToken: mockTokens.accessToken,
                refreshToken: mockTokens.refreshToken,
            });
        }));
        it('should throw a BAD_REQUEST error if user already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            UserMock.findOne.mockResolvedValue(mockUser);
            yield expect(user_service_1.UserService.createUser(mockUser)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'User already exist'));
        }));
    });
    // Test suite for updateUser
    describe('updateUser', () => {
        it('should update a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatePayload = { name: 'Updated Name' };
            const updatedUser = Object.assign(Object.assign({}, mockUser), updatePayload);
            // Ensure the user is found for this specific test
            UserMock.findById.mockResolvedValue(mockUser);
            UserMock.findByIdAndUpdate.mockResolvedValue(updatedUser);
            const result = yield user_service_1.UserService.updateUser('user-id', updatePayload, mockAdminToken);
            expect(UserMock.findById).toHaveBeenCalledWith('user-id');
            expect(UserMock.findByIdAndUpdate).toHaveBeenCalledWith('user-id', updatePayload, { new: true, runValidators: true });
            expect(result).toEqual(updatedUser);
        }));
        it('should throw a NOT_FOUND error if user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            UserMock.findById.mockResolvedValue(null);
            yield expect(user_service_1.UserService.updateUser('non-existent-id', {}, mockAdminToken)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'user not found'));
        }));
        it('should throw a FORBIDDEN error if a USER tries to change a role', () => __awaiter(void 0, void 0, void 0, function* () {
            const userToken = { role: user_interface_1.Role.USER };
            UserMock.findById.mockResolvedValue(mockUser);
            yield expect(user_service_1.UserService.updateUser('user-id', { role: user_interface_1.Role.ADMIN }, userToken)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'you are not authorized'));
        }));
        it('should throw a FORBIDDEN error if an ADMIN tries to set SUPER_ADMIN role', () => __awaiter(void 0, void 0, void 0, function* () {
            UserMock.findById.mockResolvedValue(mockUser);
            yield expect(user_service_1.UserService.updateUser('user-id', { role: user_interface_1.Role.SUPER_ADMIN }, mockAdminToken)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'you are not permitted'));
        }));
        it('should hash password if it is being updated', () => __awaiter(void 0, void 0, void 0, function* () {
            const originalPassword = 'newPassword123';
            const updatePayload = { password: originalPassword };
            UserMock.findById.mockResolvedValue(mockUser);
            bcryptMock.hash.mockResolvedValue('newHashedPassword');
            UserMock.findByIdAndUpdate.mockResolvedValue(Object.assign(Object.assign({}, mockUser), { password: 'newHashedPassword' }));
            yield user_service_1.UserService.updateUser('user-id', updatePayload, mockAdminToken);
            expect(bcryptMock.hash).toHaveBeenCalledWith(originalPassword, // Use the original, un-mutated password for the assertion
            expect.any(Number));
            expect(UserMock.findByIdAndUpdate).toHaveBeenCalledWith('user-id', expect.objectContaining({ password: 'newHashedPassword' }), expect.any(Object));
        }));
    });
    // Test suite for getAllUsers
    describe('getAllUsers', () => {
        it('should retrieve all users with metadata', () => __awaiter(void 0, void 0, void 0, function* () {
            const users = [mockUser];
            UserMock.find.mockResolvedValue(users);
            UserMock.countDocuments.mockResolvedValue(1);
            const result = yield user_service_1.UserService.getAllUsers();
            expect(UserMock.find).toHaveBeenCalledWith({});
            expect(UserMock.countDocuments).toHaveBeenCalled();
            expect(result.data).toEqual(users);
            expect(result.meta.total).toBe(1);
        }));
    });
});
