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
const userTokens_1 = require("../../utils/userTokens");
const user_model_1 = require("../user/user.model");
const auth_service_1 = require("./auth.service");
// Mock dependencies
jest.mock('../user/user.model');
jest.mock('bcryptjs');
jest.mock('../../utils/userTokens');
const UserMock = user_model_1.User;
const bcryptMock = bcryptjs_1.default;
const createUserTokenMock = userTokens_1.createUserToken;
const createNewAccessTokenWithRefreshTokenMock = userTokens_1.createNewAccessTokenWithRefreshToken;
describe('AuthServices', () => {
    const mockUser = {
        _id: 'user-id',
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
        it('should login a user successfully and return tokens', () => __awaiter(void 0, void 0, void 0, function* () {
            const selectMock = jest.fn().mockResolvedValue(mockUser);
            UserMock.findOne.mockReturnValue({ select: selectMock });
            bcryptMock.compare.mockResolvedValue(true);
            createUserTokenMock.mockReturnValue(mockTokens);
            const result = yield auth_service_1.AuthServices.credentialsLogin({
                email: mockUser.email,
                password: 'password123',
            });
            expect(UserMock.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(selectMock).toHaveBeenCalledWith('+password');
            expect(bcryptMock.compare).toHaveBeenCalledWith('password123', mockUser.password);
            expect(createUserTokenMock).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockTokens);
        }));
        it('should throw NOT_FOUND error if email does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const selectMock = jest.fn().mockResolvedValue(null);
            UserMock.findOne.mockReturnValue({ select: selectMock });
            yield expect(auth_service_1.AuthServices.credentialsLogin({
                email: 'nonexistent@example.com',
                password: 'password123',
            })).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Email doesn't exist"));
        }));
        it('should throw FORBIDDEN error if user has no password (social login)', () => __awaiter(void 0, void 0, void 0, function* () {
            const userWithoutPassword = Object.assign(Object.assign({}, mockUser), { password: '' });
            const selectMock = jest.fn().mockResolvedValue(userWithoutPassword);
            UserMock.findOne.mockReturnValue({ select: selectMock });
            yield expect(auth_service_1.AuthServices.credentialsLogin({
                email: mockUser.email,
                password: 'password123',
            })).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'DB - password not found'));
        }));
        it('should throw FORBIDDEN error for incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
            const selectMock = jest.fn().mockResolvedValue(mockUser);
            UserMock.findOne.mockReturnValue({ select: selectMock });
            bcryptMock.compare.mockResolvedValue(false);
            yield expect(auth_service_1.AuthServices.credentialsLogin({
                email: mockUser.email,
                password: 'wrongpassword',
            })).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'Incorrect password'));
        }));
    });
    // Test suite for getNewAccessToken
    describe('getNewAccessToken', () => {
        it('should return a new access token', () => __awaiter(void 0, void 0, void 0, function* () {
            const newAccessToken = 'newMockAccessToken';
            createNewAccessTokenWithRefreshTokenMock.mockResolvedValue(newAccessToken);
            const result = yield auth_service_1.AuthServices.getNewAccessToken('mockRefreshToken');
            expect(createNewAccessTokenWithRefreshTokenMock).toHaveBeenCalledWith('mockRefreshToken');
            expect(result).toEqual({ accessToken: newAccessToken });
        }));
    });
    // Test suite for resetPassword
    describe('resetPassword', () => {
        const mockDecodedToken = { userId: 'user-id' };
        const saveMock = jest.fn().mockResolvedValue(true);
        const userWithPassword = Object.assign(Object.assign({}, mockUser), { save: saveMock });
        it('should reset password successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const selectMock = jest.fn().mockResolvedValue(userWithPassword);
            UserMock.findById.mockReturnValue({ select: selectMock });
            bcryptMock.compare.mockResolvedValue(true);
            bcryptMock.hash.mockResolvedValue('newHashedPassword');
            yield auth_service_1.AuthServices.resetPassword('oldPassword', 'newPassword', mockDecodedToken);
            expect(UserMock.findById).toHaveBeenCalledWith(mockDecodedToken.userId);
            expect(selectMock).toHaveBeenCalledWith('+password');
            expect(bcryptMock.compare).toHaveBeenCalledWith('oldPassword', mockUser.password);
            expect(bcryptMock.hash).toHaveBeenCalledWith('newPassword', expect.any(Number));
            expect(saveMock).toHaveBeenCalled();
        }));
        it('should throw NOT_FOUND error if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const selectMock = jest.fn().mockResolvedValue(null);
            UserMock.findById.mockReturnValue({ select: selectMock });
            yield expect(auth_service_1.AuthServices.resetPassword('oldPassword', 'newPassword', mockDecodedToken)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User not found'));
        }));
        it('should throw BAD_REQUEST if password is not set for the account', () => __awaiter(void 0, void 0, void 0, function* () {
            const userWithoutPassword = Object.assign(Object.assign({}, mockUser), { password: '', save: saveMock });
            const selectMock = jest.fn().mockResolvedValue(userWithoutPassword);
            UserMock.findById.mockReturnValue({ select: selectMock });
            yield expect(auth_service_1.AuthServices.resetPassword('oldPassword', 'newPassword', mockDecodedToken)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Password not set for this account. Cannot reset password.'));
        }));
        it("should throw UNAUTHORIZED if old password doesn't match", () => __awaiter(void 0, void 0, void 0, function* () {
            const selectMock = jest.fn().mockResolvedValue(userWithPassword);
            UserMock.findById.mockReturnValue({ select: selectMock });
            bcryptMock.compare.mockResolvedValue(false);
            yield expect(auth_service_1.AuthServices.resetPassword('wrongOldPassword', 'newPassword', mockDecodedToken)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old password doesn't match"));
        }));
        it('should throw CONFLICT if new password is the same as the old one', () => __awaiter(void 0, void 0, void 0, function* () {
            const selectMock = jest.fn().mockResolvedValue(userWithPassword);
            UserMock.findById.mockReturnValue({ select: selectMock });
            bcryptMock.compare.mockResolvedValue(true);
            yield expect(auth_service_1.AuthServices.resetPassword('oldPassword', 'oldPassword', mockDecodedToken)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.CONFLICT, 'New password cannot be the same as the old password'));
        }));
    });
});
