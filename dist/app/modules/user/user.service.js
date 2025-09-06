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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const env_1 = require("../../config/env");
const sendWelcomeEmail_1 = require("../../nodemailer/sendWelcomeEmail");
const userTokens_1 = require("../../utils/userTokens");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = payload, rest = __rest(payload, ["email", "password", "name"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User already exist");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = {
        provider: "credentials",
        providerId: email
    };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashedPassword, name, auths: [authProvider] }, rest));
    if (user.email && user.name) {
        // We don't want to block the response if the email fails to send.
        // Log the error for debugging, but let the user registration succeed.
        (0, sendWelcomeEmail_1.sendWelcomeEmail)(user.email, user.name)
            .catch(err => console.error(`Failed to send welcome email to ${user.email}`, err));
    }
    // Generate tokens for auto-login
    const userTokens = (0, userTokens_1.createUserToken)(user);
    // Ensure the password is not sent in the response
    const userObject = user.toObject();
    delete userObject.password;
    return {
        user: userObject,
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
    };
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findById(userId);
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "user not found");
    }
    // Conditionals for role-based authorization
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "you are not authorized");
        }
        { /**
    decodedToken = info about the signed-in user (who is making the request);
    payload = info you want to update for another user
     */
        }
        if (payload.role === user_interface_1.Role.SUPER_ADMIN && decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "you are not permitted");
        }
    }
    // Authorization for sensitive fields
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.USER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "you are not authorized");
        }
    }
    // Hash password if it's being updated
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    }
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return newUpdatedUser;
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({});
    const totalUsers = yield user_model_1.User.countDocuments();
    return {
        meta: {
            total: totalUsers
        },
        data: users,
    };
});
exports.UserService = {
    createUser,
    getAllUsers,
    updateUser
};
