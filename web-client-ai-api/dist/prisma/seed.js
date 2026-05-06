import { PrismaClient, VariableKind, MembershipFunctionType, RuleConnector, CompatibilityLevel } from '@prisma/client';
import { movies } from '../src/seed-data/movies';
const prisma = new PrismaClient();
const scoreCenters = {
    calm: 20,
    light: 45,
    thoughtful: 65,
    intense: 85,
    slow: 24,
    balanced: 55,
    fast: 86,
    light_depth: 25,
    layered: 58,
    complex: 88,
};
const variableDefinitions = [
    {
        key: 'mood',
        name: 'Настроение',
        kind: VariableKind.SCORE,
        description: 'Эмоциональный тон фильма и запроса',
        displayOrder: 1,
        terms: [
            { key: 'calm', label: 'Спокойное', functionType: MembershipFunctionType.LEFT_SHOULDER, a: 20, b: 38, c: null },
            { key: 'light', label: 'Лёгкое', functionType: MembershipFunctionType.TRIANGULAR, a: 25, b: 45, c: 65 },
            { key: 'thoughtful', label: 'Вдумчивое', functionType: MembershipFunctionType.TRIANGULAR, a: 45, b: 65, c: 85 },
            { key: 'intense', label: 'Напряжённое', functionType: MembershipFunctionType.RIGHT_SHOULDER, a: 70, b: 85, c: null },
        ],
    },
    {
        key: 'preferred_genre',
        name: 'Предпочтительный жанр',
        kind: VariableKind.GENRE,
        description: 'Жанровое предпочтение пользователя',
        displayOrder: 2,
        terms: Array.from(new Set(movies.flatMap(movie => movie.genres))).sort((a, b) => a.localeCompare(b, 'ru')).map(genre => ({
            key: genre.toLowerCase().replaceAll(' ', '_'),
            label: genre,
            functionType: MembershipFunctionType.DISCRETE,
            a: null,
            b: null,
            c: null,
        })),
    },
    {
        key: 'time_budget',
        name: 'Время на просмотр',
        kind: VariableKind.DURATION,
        description: 'Подходящая длительность фильма',
        displayOrder: 3,
        terms: [
            { key: 'short', label: 'До 1 ч 40 мин', functionType: MembershipFunctionType.LEFT_SHOULDER, a: 95, b: 110, c: null },
            { key: 'medium', label: 'Обычный вечер', functionType: MembershipFunctionType.TRIANGULAR, a: 90, b: 110, c: 135 },
            { key: 'long', label: 'Готов к длинному просмотру', functionType: MembershipFunctionType.RIGHT_SHOULDER, a: 110, b: 130, c: null },
        ],
    },
    {
        key: 'pace',
        name: 'Желаемый темп',
        kind: VariableKind.SCORE,
        description: 'Динамика фильма',
        displayOrder: 4,
        terms: [
            { key: 'slow', label: 'Медленный темп', functionType: MembershipFunctionType.LEFT_SHOULDER, a: 24, b: 42, c: null },
            { key: 'balanced', label: 'Сбалансированный темп', functionType: MembershipFunctionType.TRIANGULAR, a: 30, b: 55, c: 78 },
            { key: 'fast', label: 'Быстрый темп', functionType: MembershipFunctionType.RIGHT_SHOULDER, a: 70, b: 86, c: null },
        ],
    },
    {
        key: 'story_depth',
        name: 'Глубина сюжета',
        kind: VariableKind.SCORE,
        description: 'Сложность и многослойность истории',
        displayOrder: 5,
        terms: [
            { key: 'light', label: 'Лёгкий сюжет', functionType: MembershipFunctionType.LEFT_SHOULDER, a: 25, b: 40, c: null },
            { key: 'layered', label: 'Многослойная история', functionType: MembershipFunctionType.TRIANGULAR, a: 35, b: 58, c: 80 },
            { key: 'complex', label: 'Сложный сюжет', functionType: MembershipFunctionType.RIGHT_SHOULDER, a: 70, b: 88, c: null },
        ],
    },
    {
        key: 'audience',
        name: 'Формат просмотра',
        kind: VariableKind.AUDIENCE,
        description: 'Семейный или взрослый просмотр',
        displayOrder: 6,
        terms: [
            { key: 'any', label: 'Любой формат просмотра', functionType: MembershipFunctionType.DISCRETE, a: null, b: null, c: null },
            { key: 'family', label: 'Семейный просмотр', functionType: MembershipFunctionType.DISCRETE, a: null, b: null, c: null },
            { key: 'adult', label: 'Взрослая аудитория', functionType: MembershipFunctionType.DISCRETE, a: null, b: null, c: null },
        ],
    },
];
const initialRules = [
    {
        name: 'Идеальное совпадение ключевых критериев',
        description: 'Высокое совпадение по настроению, жанру и времени',
        connector: RuleConnector.AND,
        weight: 1,
        outputLabel: 'Идеальная рекомендация',
        outputFunctionType: MembershipFunctionType.RIGHT_SHOULDER,
        outputA: 82,
        outputB: 96,
        outputC: null,
        conditions: [
            { variableKey: 'mood', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'preferred_genre', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'time_budget', expectedLevel: CompatibilityLevel.HIGH },
        ],
    },
    {
        name: 'Сильное совпадение по настроению, жанру и темпу',
        description: 'Подходящий вариант для эмоционально точного выбора',
        connector: RuleConnector.AND,
        weight: 0.94,
        outputLabel: 'Сильная рекомендация',
        outputFunctionType: MembershipFunctionType.TRIANGULAR,
        outputA: 60,
        outputB: 78,
        outputC: 92,
        conditions: [
            { variableKey: 'mood', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'preferred_genre', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'pace', expectedLevel: CompatibilityLevel.HIGH },
        ],
    },
    {
        name: 'Вдумчивый длинный просмотр',
        description: 'Подходит для длинного вдумчивого просмотра',
        connector: RuleConnector.AND,
        weight: 0.91,
        outputLabel: 'Сильная рекомендация',
        outputFunctionType: MembershipFunctionType.TRIANGULAR,
        outputA: 60,
        outputB: 77,
        outputC: 90,
        conditions: [
            { variableKey: 'mood', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'story_depth', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'time_budget', expectedLevel: CompatibilityLevel.HIGH },
        ],
    },
    {
        name: 'Семейный комфортный просмотр',
        description: 'Совпадают аудитория, жанр и комфортная длительность',
        connector: RuleConnector.AND,
        weight: 0.88,
        outputLabel: 'Уверенная рекомендация',
        outputFunctionType: MembershipFunctionType.TRIANGULAR,
        outputA: 55,
        outputB: 72,
        outputC: 88,
        conditions: [
            { variableKey: 'audience', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'preferred_genre', expectedLevel: CompatibilityLevel.HIGH },
            { variableKey: 'time_budget', expectedLevel: CompatibilityLevel.MEDIUM },
        ],
    },
    {
        name: 'Сбалансированное среднее совпадение',
        description: 'Все критерии не провалены и часть из них совпадает уверенно',
        connector: RuleConnector.AND,
        weight: 0.75,
        outputLabel: 'Умеренная рекомендация',
        outputFunctionType: MembershipFunctionType.TRIANGULAR,
        outputA: 30,
        outputB: 55,
        outputC: 75,
        conditions: [
            { variableKey: 'mood', expectedLevel: CompatibilityLevel.MEDIUM },
            { variableKey: 'preferred_genre', expectedLevel: CompatibilityLevel.MEDIUM },
            { variableKey: 'time_budget', expectedLevel: CompatibilityLevel.MEDIUM },
        ],
    },
    {
        name: 'Слабое совпадение',
        description: 'Ключевые критерии в основном не совпали',
        connector: RuleConnector.OR,
        weight: 0.8,
        outputLabel: 'Слабая рекомендация',
        outputFunctionType: MembershipFunctionType.LEFT_SHOULDER,
        outputA: 15,
        outputB: 40,
        outputC: null,
        conditions: [
            { variableKey: 'mood', expectedLevel: CompatibilityLevel.LOW },
            { variableKey: 'preferred_genre', expectedLevel: CompatibilityLevel.LOW },
            { variableKey: 'time_budget', expectedLevel: CompatibilityLevel.LOW },
        ],
    },
];
async function main() {
    await prisma.fuzzyRuleCondition.deleteMany();
    await prisma.fuzzyRule.deleteMany();
    await prisma.movieVariableValue.deleteMany();
    await prisma.fuzzyTerm.deleteMany();
    await prisma.fuzzyVariable.deleteMany();
    await prisma.movie.deleteMany();
    for (const definition of variableDefinitions) {
        await prisma.fuzzyVariable.create({
            data: {
                key: definition.key,
                name: definition.name,
                description: definition.description,
                kind: definition.kind,
                displayOrder: definition.displayOrder,
                terms: {
                    create: definition.terms.map(term => ({
                        key: term.key,
                        label: term.label,
                        functionType: term.functionType,
                        a: term.a,
                        b: term.b,
                        c: term.c,
                    })),
                },
            },
        });
    }
    const scoreVariables = await prisma.fuzzyVariable.findMany({
        where: {
            kind: VariableKind.SCORE,
        },
    });
    const scoreVariableMap = Object.fromEntries(scoreVariables.map(variable => [variable.key, variable.id]));
    for (const movie of movies) {
        await prisma.movie.create({
            data: {
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
                variableValues: {
                    create: [
                        {
                            variableId: scoreVariableMap.mood,
                            value: scoreCenters[movie.moodValue],
                        },
                        {
                            variableId: scoreVariableMap.pace,
                            value: scoreCenters[movie.paceValue],
                        },
                        {
                            variableId: scoreVariableMap.story_depth,
                            value: movie.depthValue === 'light'
                                ? scoreCenters.light_depth
                                : scoreCenters[movie.depthValue],
                        },
                    ],
                },
            },
        });
    }
    const variables = await prisma.fuzzyVariable.findMany();
    const variableMap = Object.fromEntries(variables.map(variable => [variable.key, variable.id]));
    for (const rule of initialRules) {
        await prisma.fuzzyRule.create({
            data: {
                name: rule.name,
                description: rule.description,
                connector: rule.connector,
                weight: rule.weight,
                outputLabel: rule.outputLabel,
                outputFunctionType: rule.outputFunctionType,
                outputA: rule.outputA,
                outputB: rule.outputB,
                outputC: rule.outputC,
                conditions: {
                    create: rule.conditions.map(condition => ({
                        variableId: variableMap[condition.variableKey],
                        expectedLevel: condition.expectedLevel,
                    })),
                },
            },
        });
    }
}
main()
    .catch(error => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
