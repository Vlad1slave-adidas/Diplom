import type {
	CompatibilityLevel,
	FuzzyRule,
	FuzzyRuleCondition,
	FuzzyTerm,
	FuzzyVariable,
	MembershipFunctionType,
	Movie,
	MovieVariableValue,
	RuleConnector,
	VariableKind,
} from '@prisma/client'

export type VariableWithTerms = FuzzyVariable & {
	terms: FuzzyTerm[]
}

export type MovieWithValues = Movie & {
	variableValues: Array<
		MovieVariableValue & {
			variable: FuzzyVariable
		}
	>
}

export type RuleWithConditions = FuzzyRule & {
	conditions: Array<
		FuzzyRuleCondition & {
			variable: FuzzyVariable
		}
	>
}

export interface MembershipBands {
	low: number
	medium: number
	high: number
}

export interface SearchPayload {
	inputs: Record<string, string>
	filters?: {
		genre?: string
		year?: string
		country?: string
		order?: string
	}
}

export interface CompatibilityResult {
	variableKey: string
	value: number
	bands: MembershipBands
}

export interface RecommendationResult {
	movie: MovieWithValues
	score: number
	reasons: string[]
	compatibilities: CompatibilityResult[]
	rules: Array<{ name: string; strength: number }>
}

export interface VariablePayload {
	key: string
	name: string
	description?: string
	kind: VariableKind
	isActive?: boolean
	exposeInSearch?: boolean
	displayOrder?: number
}

export interface TermPayload {
	variableId: number
	key: string
	label: string
	functionType: MembershipFunctionType
	a?: number | null
	b?: number | null
	c?: number | null
	isActive?: boolean
}

export interface MoviePayload {
	slug: string
	title: string
	year: number
	country: string
	genres: string[]
	duration: number
	ageRating: number
	rating: number
	shortDescription: string
	description: string
	poster: string
	backdrop: string
	provider: string
	familyFriendly: boolean
	scoreValues: Record<string, number>
}

export interface RulePayload {
	name: string
	description?: string
	isActive?: boolean
	weight?: number
	connector?: RuleConnector
	outputLabel: string
	outputFunctionType: MembershipFunctionType
	outputA?: number | null
	outputB?: number | null
	outputC?: number | null
	conditions: Array<{
		variableId: number
		expectedLevel: CompatibilityLevel
	}>
}
