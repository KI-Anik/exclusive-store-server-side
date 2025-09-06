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
exports.AuthServices = void 0;
const userTokens_1 = require("../../utils/userTokens");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const credentialsLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    // Explicitly select the password field, which is excluded by default
    const isUserExist = yield user_model_1.User.findOne({ email }).select('+password');
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Email doesn't exist");
    }
    if (!isUserExist.password) {
        // handles users that were created without a password (e.g. social login)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "DB - password not found");
    }
    const isPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Incorrect password");
    }
    const userTokens = (0, userTokens_1.createUserToken)(isUserExist);
    // Ensure password is not sent back
    const userObject = isUserExist.toObject();
    delete userObject.password;
    return {
        user: userObject,
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
});
const resetPassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    // Select the password field, which is excluded by default in the schema
    const user = yield user_model_1.User.findById(decodedToken.userId).select('+password');
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (!user.password) {
        // handles users that were created without a password (e.g. social login)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Password not set for this account. Cannot reset password.");
    }
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch)
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old password doesn't match");
    if (oldPassword === newPassword)
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "New password cannot be the same as the old password");
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    yield user.save();
});
exports.AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword
};
