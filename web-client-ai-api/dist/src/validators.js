import { CompatibilityLevel, MembershipFunctionType, RuleConnector, VariableKind, } from '@prisma/client';
import { z } from 'zod';
export const movieSchema = z.object({
    slug: z.string().min(2),
    title: z.string().min(1),
    year: z.number().int().min(1900).max(2100),
    country: z.string().min(1),
    genres: z.array(z.string().min(1)).min(1),
    duration: z.number().int().min(40).max(300),
    ageRating: z.number().int().min(0).max(21),
    rating: z.number().min(0).max(10),
    shortDescription: z.string().min(10),
    description: z.string().min(20),
    poster: z.string().min(1),
    backdrop: z.string().min(1),
    provider: z.string().min(1),
    familyFriendly: z.boolean(),
    scoreValues: z.record(z.string(), z.number().min(0).max(100)),
});
export const variableSchema = z.object({
    key: z.string().min(2),
    name: z.string().min(2),
    description: z.string().optional(),
    kind: z.nativeEnum(VariableKind),
    isActive: z.boolean().optional(),
    exposeInSearch: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
});
export const termSchema = z.object({
    variableId: z.number().int(),
    key: z.string().min(1),
    label: z.string().min(1),
    functionType: z.nativeEnum(MembershipFunctionType),
    a: z.number().nullable().optional(),
    b: z.number().nullable().optional(),
    c: z.number().nullable().optional(),
    isActive: z.boolean().optional(),
});
export const ruleSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    weight: z.number().min(0).max(1.5).optional(),
    connector: z.nativeEnum(RuleConnector).optional(),
    outputLabel: z.string().min(2),
    outputFunctionType: z.nativeEnum(MembershipFunctionType),
    outputA: z.number().nullable().optional(),
    outputB: z.number().nullable().optional(),
    outputC: z.number().nullable().optional(),
    conditions: z
        .array(z.object({
        variableId: z.number().int(),
        expectedLevel: z.nativeEnum(CompatibilityLevel),
    }))
        .min(1),
});
export const searchSchema = z.object({
    inputs: z.record(z.string(), z.string()),
    filters: z
        .object({
        genre: z.string().optional(),
        year: z.string().optional(),
        country: z.string().optional(),
        order: z.string().optional(),
    })
        .optional(),
});
