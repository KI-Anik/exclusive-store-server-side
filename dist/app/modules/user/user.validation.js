"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    // inside body because of validateTRequest.ts structure
    body: zod_1.default.object({
        name: zod_1.default
            .string({ invalid_type_error: "Name must be string" })
            .min(2, { message: "name must be at least 2 character long" })
            .max(50, { message: "Name cannot exceed 50 character" }),
        email: zod_1.default
            .string({ invalid_type_error: "email must be string" })
            .email({ message: "invalid email format" }),
        password: zod_1.default
            .string({ invalid_type_error: "password must be a string" })
            .min(6, { message: "password must be at least 6 character long" }),
        picture: zod_1.default
            .string({ invalid_type_error: "picture should be added" })
    })
});
exports.updateUserZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default
            .string({ invalid_type_error: "name must be string" })
            .min(2, { message: "name must be contain at least 2 character" })
            .max(50, { message: "Name cannot exceed 50 characters" }).optional(),
        password: zod_1.default
            .string({ invalid_type_error: "password must be string" })
            .min(8, { message: "password must be 8 character long" })
            .regex(/^(?=.*[A-Z])/, {
            message: "password must contain at least 1 upper case letter"
        })
            .regex(/^(?=.*[!@#$%^&*])/, {
            message: "password must contain at least 1 special character"
        })
            .regex(/^(?=.*\d)/, {
            message: "password must contain at least 1 number"
        }).optional(),
        phone: zod_1.default
            .string({ invalid_type_error: "phone number must be string" })
            .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "phone number must be valid for Bangladesh"
        }).optional(),
        role: zod_1.default
            .enum([user_interface_1.Role.USER, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN])
            .optional(),
        isActive: zod_1.default
            .enum([user_interface_1.IsActive.ACTIVE, user_interface_1.IsActive.INACTIVE, user_interface_1.IsActive.BLOCKED])
            .optional(),
        isDeleted: zod_1.default
            .boolean({ invalid_type_error: "isDeleted must be true or false" })
            .optional(),
        isVerified: zod_1.default
            .boolean({ invalid_type_error: "isVerified must be true or false" })
            .optional(),
        address: zod_1.default
            .string({ invalid_type_error: "address must be string" })
            .max(200, { message: "address cannot exceed 200 character" })
            .optional()
    })
});
