# AGENTS.md - Development Guidelines for vue-webchat

This document provides guidelines for AI agents working on this Vue 3 + TypeScript project.

## Build, Lint, and Test Commands

### Package Manager
```bash
pnpm install    # Install dependencies
```

### Development
```bash
pnpm dev        # Start development server
```

### Build
```bash
pnpm build      # Type-check with vue-tsc and build for production
pnpm preview    # Preview production build locally
```

### Testing
This project does not currently have a test framework configured. When adding tests:
- Use Vitest for unit testing
- Use Cypress or Playwright for E2E testing

### Type Checking
```bash
pnpm build      # Runs vue-tsc -b for type checking
```

## Code Style Guidelines

### General Principles
- Write clean, readable, and maintainable code
- Follow Vue 3 Composition API patterns
- Use TypeScript strict mode for type safety
- Keep functions small and focused

### TypeScript Conventions

**Strict Mode Enabled**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`

**Type Definitions**:
- Use interfaces for object shapes and API responses
- Use type for unions, intersections, and primitive types
- Export all interfaces/types that are used across modules
- Use `Partial<T>`, `Pick<T>`, `Omit<T>` for optional/partial types

```typescript
// Good
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
}

export interface LoginParams {
  username: string
  password: string
}

// Good - JSDoc for complex functions
/**
 * User login
 */
export function login(data: LoginParams) {
  return request<User>({
    url: '/auth/login',
    method: 'post',
    data
  })
}
```

### Vue Component Structure

**Script Section**:
- Use `<script setup lang="ts">` for all components
- Put imports at the top, grouped logically
- Use auto-imported composables (Vue, Pinia, Vue Router APIs)
- Use `storeToRefs()` for reactive state from stores
- Define props with `defineProps<{...}>()` and emits with `defineEmits<{...}>()`

**Template Section**:
- Use semantic element names
- Keep logic out of templates; use computed properties
- Use `v-if` and `v-show` appropriately (v-if for conditional rendering, v-show for toggle)
- Bind classes and styles with object/array syntax

**Style Section**:
- Use `<style scoped lang="scss">` for component-scoped styles
- Use SCSS variables from `@/styles/variables.scss`
- Follow BEM-like naming: `.block`, `.block__element`, `.block--modifier`
- Use flexbox/grid for layouts

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/store/counter'

const counterStore = useCounterStore()
const { count, doubleCount } = storeToRefs(counterStore)
const { increment, decrement } = counterStore

const inputValue = ref<number>(0)

const isPositive = computed(() => count.value > 0)
</script>

<template>
  <div class="counter">
    <span class="counter__value">{{ count }}</span>
    <button class="counter__button" @click="increment">+</button>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.counter {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  &__value {
    font-size: $font-size-lg;
  }

  &__button {
    padding: $spacing-sm $spacing-md;
  }
}
</style>
```

### Import Conventions

**Order of imports**:
1. Vue core imports
2. Vue Router / Pinia
3. Component libraries (Element Plus, Ant Design Vue - auto-imported)
4. Custom utilities from `@/utils/`
5. Custom stores from `@/store/`
6. Custom APIs from `@/apis/`
7. Custom components from `@/components/` (auto-imported)

**Path aliases**:
- Use `@/` for `src/` directory: `import Foo from '@/components/Foo'`
- Use `@/utils/` for utility functions: `import { formatDate } from '@/utils/date'`

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.vue`, `BaseButton.vue` |
| Variables | camelCase | `userName`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| Interfaces | PascalCase | `UserInfo`, `LoginParams` |
| Types | PascalCase | `UserRole`, `ApiResponse<T>` |
| Functions | camelCase | `handleSubmit()`, `fetchData()` |
| Store | camelCase | `useUserStore`, `useCounterStore` |
| CSS classes | kebab-case | `.user-profile`, `.card-header` |

### Error Handling

**API Requests**:
- Use try-catch for async operations
- Show user feedback with Element Plus `ElMessage` or Ant Design Vue `message`
- Handle network errors gracefully
- Return rejected Promises for error cases

```typescript
const fetchUser = async () => {
  try {
    const data = await getUserInfo()
    return data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    message.error('获取用户信息失败')
    return null
  }
}
```

**Store Actions**:
- Validate inputs before mutations
- Handle edge cases
- Return results or throw errors

### State Management (Pinia)

**Store Structure**:
- Use Setup Stores or Option Stores consistently
- Define types for state, getters, and actions
- Keep state serializable

```typescript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter Store'
  }),

  getters: {
    doubleCount: (state) => state.count * 2
  },

  actions: {
    increment() {
      this.count++
    },

    setCount(value: number) {
      this.count = value
    }
  }
})
```

### Router Configuration

**Routes**:
- Use lazy loading with dynamic imports
- Define proper types with `RouteRecordRaw`
- Add meta fields for titles, permissions, etc.
- Use named routes for navigation

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  }
]
```

### SCSS Variables

Use predefined variables from `@/styles/variables.scss`:
- Spacing: `$spacing-xs`, `$spacing-sm`, `$spacing-md`, `$spacing-lg`, `$spacing-xl`
- Colors: Use Element Plus theme variables
- Fonts: Use standard CSS font properties

### Auto-Imports

The following APIs are auto-imported (do not import manually):
- Vue 3: `ref`, `reactive`, `computed`, `watch`, `onMounted`, etc.
- Vue Router: `useRouter`, `useRoute`
- Pinia: `useStore`, `storeToRefs`
- Component libraries: All Element Plus and Ant Design Vue components

### Icons

**Element Plus Icons**: Auto-imported, use directly: `<el-icon><Plus /></el-icon>`

**Font Awesome Icons**: Import from `@fortawesome/free-solid-svg-icons`, add to library in `main.ts`:
```typescript
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser } from '@fortawesome/free-solid-svg-icons'
library.add(faUser)

// Template usage
<font-awesome-icon :icon="['fas', 'user']" />
```

### File Organization

```
src/
├── apis/           # API interface definitions (user.ts, etc.)
├── assets/         # Static assets (fonts, images)
├── components/     # Shared components
├── router/         # Route configuration
├── store/          # Pinia stores
├── styles/         # Global SCSS styles and variables
├── types/          # TypeScript type declarations
├── utils/          # Utility functions (request.ts, encrypt.ts, etc.)
├── views/          # Page components
├── App.vue         # Root component
└── main.ts         # Application entry point
```

### Important Notes

1. **No linting tool configured**: Manually check code quality
2. **No tests configured**: When adding tests, place them in `tests/` directory
3. **Dual UI libraries**: Project uses both Element Plus and Ant Design Vue
4. **RSA encryption**: Keys stored in `src/utils/encrypt.ts` - never commit real keys
5. **Environment variables**: Use `.env` file for configuration, prefix with `VITE_`
