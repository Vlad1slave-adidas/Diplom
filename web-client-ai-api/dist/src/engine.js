import { CompatibilityLevel, MembershipFunctionType, RuleConnector, VariableKind, } from '@prisma/client';
const genreNeighbors = {
    Комедия: ['Семейный', 'Романтика', 'Мелодрама'],
    Драма: ['История', 'Мелодрама', 'Семейный'],
    Триллер: ['Детектив', 'Боевик', 'Фантастика'],
    Фантастика: ['Триллер', 'Драма', 'Приключения'],
    Семейный: ['Комедия', 'Приключения', 'Мелодрама'],
    Приключения: ['Боевик', 'Семейный', 'Фантастика', 'Спорт'],
    Мелодрама: ['Драма', 'Комедия', 'Романтика'],
    Боевик: ['Триллер', 'Приключения', 'Фантастика'],
    Детектив: ['Триллер', 'Драма'],
    Спорт: ['Драма', 'Приключения'],
    История: ['Драма'],
    Романтика: ['Комедия', 'Мелодрама'],
};
function clamp(value) {
    return Math.max(0, Math.min(1, value));
}
function evaluateShape(type, x, a, b, c) {
    switch (type) {
        case MembershipFunctionType.LEFT_SHOULDER:
            if (a == null || b == null)
                return 0;
            if (x <= a)
                return 1;
            if (x >= b)
                return 0;
            return clamp((b - x) / (b - a));
        case MembershipFunctionType.RIGHT_SHOULDER:
            if (a == null || b == null)
                return 0;
            if (x <= a)
                return 0;
            if (x >= b)
                return 1;
            return clamp((x - a) / (b - a));
        case MembershipFunctionType.TRIANGULAR:
            if (a == null || b == null || c == null)
                return 0;
            if (x <= a || x >= c)
                return 0;
            if (x === b)
                return 1;
            if (x < b)
                return clamp((x - a) / (b - a));
            return clamp((c - x) / (c - b));
        case MembershipFunctionType.DISCRETE:
            return 0;
    }
}
function toMembershipBands(value) {
    const normalized = Math.max(0, Math.min(100, value));
    const low = normalized <= 25 ? 1 : normalized >= 55 ? 0 : (55 - normalized) / 30;
    const medium = normalized <= 30 || normalized >= 80
        ? 0
        : normalized <= 55
            ? (normalized - 30) / 25
            : (80 - normalized) / 25;
    const high = normalized <= 55 ? 0 : normalized >= 80 ? 1 : (normalized - 55) / 25;
    return {
        low: clamp(low),
        medium: clamp(medium),
        high: clamp(high),
    };
}
function getMovieScoreValue(movie, variableId) {
    return movie.variableValues.find(item => item.variableId === variableId)?.value ?? null;
}
function getTermMembership(variable, termKey, movie) {
    const term = variable.terms.find(item => item.key === termKey);
    if (!term)
        return 0;
    switch (variable.kind) {
        case VariableKind.SCORE: {
            const score = getMovieScoreValue(movie, variable.id);
            if (score == null)
                return 0;
            return evaluateShape(term.functionType, score, term.a, term.b, term.c);
        }
        case VariableKind.DURATION:
            return evaluateShape(term.functionType, movie.duration, term.a, term.b, term.c);
        case VariableKind.GENRE:
            if (movie.genres.includes(term.label))
                return 1;
            return genreNeighbors[term.label]?.some(item => movie.genres.includes(item))
                ? 0.72
                : 0.22;
        case VariableKind.AUDIENCE:
            if (term.key === 'any')
                return 0.65;
            if (term.key === 'family')
                return movie.familyFriendly ? 1 : 0.18;
            if (term.key === 'adult')
                return movie.familyFriendly ? 0.45 : 1;
            return 0;
    }
}
function evaluateCompatibility(variable, selectedTermKey, movie) {
    if (!selectedTermKey) {
        return {
            variableKey: variable.key,
            value: 65,
            bands: toMembershipBands(65),
        };
    }
    const membership = getTermMembership(variable, selectedTermKey, movie);
    const value = Number((membership * 100).toFixed(2));
    return {
        variableKey: variable.key,
        value,
        bands: toMembershipBands(value),
    };
}
function getBandValue(level, bands) {
    switch (level) {
        case CompatibilityLevel.LOW:
            return bands.low;
        case CompatibilityLevel.MEDIUM:
            return bands.medium;
        case CompatibilityLevel.HIGH:
            return bands.high;
    }
}
function defuzzify(ruleShapes) {
    const domain = Array.from({ length: 101 }, (_, index) => index);
    let numerator = 0;
    let denominator = 0;
    for (const x of domain) {
        const aggregated = Math.max(...ruleShapes.map(({ strength, rule }) => Math.min(strength, evaluateShape(rule.outputFunctionType, x, rule.outputA, rule.outputB, rule.outputC))), 0);
        numerator += x * aggregated;
        denominator += aggregated;
    }
    return denominator === 0 ? 0 : numerator / denominator;
}
export function buildRecommendations(params) {
    const { movies, variables, rules, payload } = params;
    const activeSearchVariables = variables
        .filter(variable => variable.isActive)
        .sort((left, right) => left.displayOrder - right.displayOrder);
    const filteredMovies = movies.filter(movie => {
        const filters = payload.filters ?? {};
        if (filters.genre && !movie.genres.includes(filters.genre))
            return false;
        if (filters.year && String(movie.year) !== filters.year)
            return false;
        if (filters.country && movie.country !== filters.country)
            return false;
        return true;
    });
    return filteredMovies
        .map(movie => {
        const compatibilities = activeSearchVariables.map(variable => evaluateCompatibility(variable, payload.inputs[variable.key], movie));
        const compatibilityMap = Object.fromEntries(compatibilities.map(item => [item.variableKey, item]));
        const ruleShapes = rules
            .filter(rule => rule.isActive)
            .map(rule => {
            const conditionValues = rule.conditions.map(condition => {
                const compatibility = compatibilityMap[condition.variable.key];
                if (!compatibility)
                    return 0;
                return getBandValue(condition.expectedLevel, compatibility.bands);
            });
            const baseStrength = rule.connector === RuleConnector.AND
                ? Math.min(...conditionValues)
                : Math.max(...conditionValues);
            return {
                strength: clamp(baseStrength * rule.weight),
                rule,
            };
        })
            .filter(item => item.strength > 0);
        const score = Number(defuzzify(ruleShapes).toFixed(2));
        const reasons = ruleShapes
            .sort((left, right) => right.strength - left.strength)
            .slice(0, 3)
            .map(item => item.rule.name) || [];
        return {
            movie,
            score,
            reasons: reasons.length > 0
                ? reasons
                : ['Рекомендация получена по базовому совпадению критериев поиска.'],
            compatibilities,
            rules: ruleShapes.map(item => ({
                name: item.rule.name,
                strength: Number(item.strength.toFixed(3)),
            })),
        };
    })
        .sort((left, right) => {
        const order = payload.filters?.order || 'recommendation';
        switch (order) {
            case 'rating':
                return right.movie.rating - left.movie.rating;
            case 'year':
                return right.movie.year - left.movie.year;
            case 'title':
                return left.movie.title.localeCompare(right.movie.title, 'ru');
            default:
                return right.score - left.score || right.movie.rating - left.movie.rating;
        }
    });
}
