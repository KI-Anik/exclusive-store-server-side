import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    // inside body because of validateTRequest.ts structure
    body: z.object({
        name: z
            .string({ invalid_type_error: "Name must be string" })
            .min(2, { message: "name must be at least 2 character long" })
            .max(50, { message: "Name cannot exceed 50 character" }),
        email: z
            .string({ invalid_type_error: "email must be string" })
            .email({ message: "invalid email format" }),
        password: z
            .string({ invalid_type_error: "password must be a string" })
            .min(6, { message: "password must be at least 6 character long" })
    })
});


export const updateUserZodSchema = z.object({
    body: z.object({
        name: z
            .string({ invalid_type_error: "name must be string" })
            .min(2, { message: "name must be contain at least 2 character" })
            .max(50, { message: "Name cannot exceed 50 characters" }).optional(),
        password: z
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
        phone: z
            .string({ invalid_type_error: "phone number must be string" })
            .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
                message: "phone number must be valid for Bangladesh"
            }).optional(),
        role: z
            .enum([Role.USER, Role.ADMIN, Role.SUPER_ADMIN])
            .optional(),
        isActive: z
            .enum([IsActive.ACTIVE, IsActive.INACTIVE, IsActive.BLOCKED])
            .optional(),
        isDeleted: z
            .boolean({ invalid_type_error: "isDeleted must be true or false" })
            .optional(),
        isVerified: z
            .boolean({ invalid_type_error: "isVerified must be true or false" })
            .optional(),
        address: z
            .string({ invalid_type_error: "address must be string" })
            .max(200, { message: "address cannot exceed 200 character" })
            .optional()

    })
});
