"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.loginZodSchema = zod_1.default.object({
    // inside body because of validateTRequest.ts structure
    body: zod_1.default.object({
        email: zod_1.default
            .string()
            .email({ message: "Invalid email address" }),
        password: zod_1.default
            .string()
            .min(6, { message: "password must be at least 6 character long" })
    })
});
