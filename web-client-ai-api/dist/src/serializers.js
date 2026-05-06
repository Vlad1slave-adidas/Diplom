import { VariableKind } from '@prisma/client';
export function serializeVariable(variable) {
    return {
        id: variable.id,
        key: variable.key,
        name: variable.name,
        description: variable.description,
        kind: variable.kind,
        isActive: variable.isActive,
        exposeInSearch: variable.exposeInSearch,
        displayOrder: variable.displayOrder,
        terms: variable.terms.map(term => ({
            id: term.id,
            key: term.key,
            label: term.label,
            functionType: term.functionType,
            a: term.a,
            b: term.b,
            c: term.c,
            isActive: term.isActive,
        })),
    };
}
export function serializeMovie(movie) {
    return {
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        country: movie.country,
        genres: movie.genres,
        duration: movie.duration,
        ageRating: movie.ageRating,
        rating: movie.rating,
        shortDescription: movie.shortDescription,
        description: movie.description,
        poster: movie.poster,
        backdrop: movie.backdrop,
        provider: movie.provider,
        familyFriendly: movie.familyFriendly,
        scoreValues: Object.fromEntries(movie.variableValues.map(item => [item.variable.key, item.value])),
    };
}
export function serializeRule(rule) {
    return {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        isActive: rule.isActive,
        weight: rule.weight,
        connector: rule.connector,
        outputLabel: rule.outputLabel,
        outputFunctionType: rule.outputFunctionType,
        outputA: rule.outputA,
        outputB: rule.outputB,
        outputC: rule.outputC,
        conditions: rule.conditions.map(condition => ({
            id: condition.id,
            variableId: condition.variableId,
            variableKey: condition.variable.key,
            variableName: condition.variable.name,
            expectedLevel: condition.expectedLevel,
        })),
    };
}
export function getDefaultScoreVariables(variables) {
    return variables.filter(variable => variable.kind === VariableKind.SCORE);
}
