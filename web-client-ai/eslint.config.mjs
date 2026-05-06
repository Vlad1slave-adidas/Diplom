import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

const eslintConfig = defineConfig([
	...nextVitals,
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
	{
		files: ['**/*.ts', '**/*.tsx'],
		plugins: {
			'@typescript-eslint': typescriptEslint,
		},
		languageOptions: {
			parser: typescriptParser,
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},
])

export default eslintConfig
