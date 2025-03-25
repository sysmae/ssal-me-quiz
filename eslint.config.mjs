import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // 미사용 변수 경고 비활성화
      '@typescript-eslint/no-unused-vars': 'off',
      // any 타입 경고 비활성화
      '@typescript-eslint/no-explicit-any': 'off',
      // img 태그 경고를 에러에서 경고로 변경
      '@next/next/no-img-element': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
]

export default eslintConfig
