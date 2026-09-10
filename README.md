# Plume React Router Proxy

A powerful, type-safe route management utility for [React Router](https://reactrouter.com/home).

It provides a declarative way to define routes with hierarchy, automatically handles and validates route parameters, manages typed query parameters, and provides a type-safe proxy for navigation and link generation.

---

## Features

- **Type Safety**: Full TypeScript type inference for route names, mandatory path parameters, and query parameters.
- **Hierarchical & Modular Routes**: Define nested routes and inherit paths from parent routes across modules using `{ parent: ... }` or `.extend()`.
- **Relative Path Calculation (`path({ relativeTo })`)**: Compute relative paths for nested React Router route definitions without manual string slicing.
- **Navigation Proxy**: Navigate using an intuitive, typed API (`push`, `replace`, `link`, `params`, `queryParams`, `name`).
- **Standalone Route Building (`buildRoute`)**: Build URLs and typed route configurations outside React components without navigation functions.
- **Query Parameters**: Strongly-typed query parameters with automatic formatting and filtering of `null`/`undefined` values (`withQueryParams`).
- **URL Sanitization**: Automatically normalizes leading and trailing slashes.
- **React Router Integration**: Works seamlessly with `react-router` (`useNavigate`, `useRoutes`, `<Link>`, `<NavLink>`).

---

## Installation & Setup

Import the utility from `typed-react-router-proxy`:

```typescript
import {
  buildRoute,
  createRoutes,
  defineRoute,
  defineRouteConfig,
  Routes,
  RouteDefinition,
} from 'typed-react-router-proxy';
```

---

## Core Concepts & Quick Start

### 1. Define Routes

Create a route configuration file. Parameters (e.g., `:userId`, `:projectId`) are automatically inferred from path strings.

```typescript
import {
  createRoutes,
  defineRoute,
  defineRouteConfig,
  Routes,
} from 'typed-react-router-proxy';

// 1. Define route keys (Enums or constants)
export enum UserRoutes {
  LIST = 'list',
  DETAIL = 'detail',
  CREATE = 'create',
  POST_DETAIL = 'postDetail',
  SEARCH = 'search',
}

// 2. Base route definition
const baseRoute = defineRoute('users');

// 3. Define route configurations
const USER_ROUTES_CONFIG = defineRouteConfig({
  [UserRoutes.LIST]: baseRoute,
  // Parameters are inferred from ':userId'
  [UserRoutes.DETAIL]: baseRoute.extend(':userId'),
  [UserRoutes.CREATE]: baseRoute.extend('create'),
  // Multiple parameters are supported
  [UserRoutes.POST_DETAIL]: baseRoute.extend(':userId/posts/:postId'),
  // Query parameters can be added using withQueryParams<T>()
  [UserRoutes.SEARCH]: baseRoute.extend('search').withQueryParams<{ query: string; page?: number }>(),
});

// 4. Export configuration type
export type UserRoutesType = typeof USER_ROUTES_CONFIG;

// 5. Create routes proxy and static route definitions
export const {
  useRoutes: useUserRoutes,
  routes: userRoutes,
}: Routes<UserRoutesType> = createRoutes<UserRoutesType>(USER_ROUTES_CONFIG);
```

### 2. Configure React Router

Use the route configuration (`userRoutes`) and its `relativePath` or `path()` helpers inside your React Router setup.

```tsx
import React from 'react';
import { useRoutes, Navigate } from 'react-router';
import { UseRoutes } from 'typed-react-router-proxy';
import {
  userRoutes,
  useUserRoutes,
  UserRoutesType,
} from './users-routes.config';

export default function UsersRouter() {
  const routes: UseRoutes<UserRoutesType> = useUserRoutes();

  return useRoutes([
    {
      path: userRoutes.list.relativePath, // "users"
      element: <UserList />,
    },
    {
      path: userRoutes.create.relativePath, // "create"
      element: <UserCreate />,
    },
    {
      path: userRoutes.detail.relativePath, // ":userId"
      element: <UserDetail />,
    },
    {
      path: '*',
      element: <Navigate to={routes.list().link} replace />,
    },
  ]);
}
```

### 3. Navigate & Generate Links in Components

```tsx
import React from 'react';
import { Link } from 'react-router';
import { UseRoutes } from 'typed-react-router-proxy';
import { useUserRoutes, UserRoutesType } from './users-routes.config';

export default function UserCard({ userId }: { userId: string }) {
  const routes: UseRoutes<UserRoutesType> = useUserRoutes();

  const handleEdit = () => {
    // Navigate using push (adds entry to browser history)
    routes.detail({ userId }).push();
  };

  const handleReplace = () => {
    // Navigate using replace (replaces current entry in browser history)
    routes.detail({ userId }).replace();
  };

  return (
    <div>
      {/* Generate typed href string using .link */}
      <Link to={routes.detail({ userId }).link}>
        View Profile
      </Link>

      {/* Query params can be passed as second arg for routes with path params */}
      <Link to={routes.search({ query: 'john', page: 1 }).link}>
        Search
      </Link>

      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleReplace}>Replace</button>
    </div>
  );
}
```

---

## Detailed Use Cases & Examples

### Use Case 1: Modular Routes & Cross-Module Hierarchy (`parent`)

When building modular applications, child modules frequently inherit from a parent module's route without duplicating paths.

```typescript
// 1. Root router: src/router/routes.config.ts
export enum AppRoutes {
  HOME = 'home',
  ADMIN = 'admin',
}

const APP_ROUTES = defineRouteConfig({
  [AppRoutes.HOME]: defineRoute(''),
  [AppRoutes.ADMIN]: defineRoute('admin'),
});

export type AppRoutesType = typeof APP_ROUTES;
export const {
  useRoutes: useAppRoutes,
  routes: appRoutes,
}: Routes<AppRoutesType> = createRoutes<AppRoutesType>(APP_ROUTES);
```

```typescript
// 2. Administration submodule: src/modules/admin/users/users-routes.config.ts
import { appRoutes } from '@router/routes.config';

export enum AdminUserRoutes {
  LIST = 'list',
  DETAIL = 'detail',
  SETTINGS = 'settings',
}

// Attach the sub-route to the parent module route
const baseAdminUserRoute = defineRoute('users', { parent: appRoutes.admin });

const ADMIN_USER_ROUTES = defineRouteConfig({
  [AdminUserRoutes.LIST]: baseAdminUserRoute,
  [AdminUserRoutes.DETAIL]: baseAdminUserRoute.extend(':userId'),
  [AdminUserRoutes.SETTINGS]: baseAdminUserRoute.extend(':userId/settings'),
});

export type AdminUserRoutesType = typeof ADMIN_USER_ROUTES;
export const {
  useRoutes: useAdminUserRoutes,
  routes: adminUserRoutes,
}: Routes<AdminUserRoutesType> = createRoutes<AdminUserRoutesType>(ADMIN_USER_ROUTES);
```

**Resulting Paths:**
- `adminUserRoutes.list.path()` $\rightarrow$ `"/admin/users"`
- `adminUserRoutes.detail.path()` $\rightarrow$ `"/admin/users/:userId"`
- `routes.detail({ userId: '42' }).link` $\rightarrow$ `"/admin/users/42"`

---

### Use Case 2: Deep Nesting & React Router Sub-Routers with `path({ relativeTo })`

When mounting a nested router at `/admin/*`, child routes need their path relative to the ancestor `/admin` rather than the absolute root path.

```tsx
import React from 'react';
import { useRoutes } from 'react-router';
import { appRoutes } from '@router/routes.config';
import { adminUserRoutes } from './users-routes.config';

export default function AdminSubRouter() {
  return useRoutes([
    {
      // Computes "users" instead of "admin/users"
      path: adminUserRoutes.list.path({ relativeTo: appRoutes.admin }),
      element: <AdminUsersList />,
    },
    {
      // Computes "users/:userId" instead of "admin/users/:userId"
      path: adminUserRoutes.detail.path({ relativeTo: appRoutes.admin }),
      element: <AdminUserDetail />,
    },
  ]);
}
```

---

### Use Case 3: Multiple Path Parameters

Path parameters are fully extracted and typed as a combined object:

```typescript
const PROJECT_ROUTES = defineRouteConfig({
  SUBTASK_DETAIL: defineRoute('projects')
    .extend(':projectId')
    .extend('tasks/:taskId')
    .extend('subtasks/:subtaskId'),
});

export const { useRoutes: useProjectRoutes } = createRoutes(PROJECT_ROUTES);

// In a component:
const routes = useProjectRoutes();

// TypeScript enforces all three arguments: { projectId, taskId, subtaskId }
routes.SUBTASK_DETAIL({
  projectId: 'p-100',
  taskId: 't-20',
  subtaskId: 'st-3',
}).push();
// Navigates to: "/projects/p-100/tasks/t-20/subtasks/st-3"
```

---

### Use Case 4: Typed Query Parameters (`withQueryParams`)

Query parameters are defined via `.withQueryParams<T>()`.

- For routes **without** path parameters, query parameters are the **first** argument (optional `Partial<T>`).
- For routes **with** path parameters, query parameters are the **second** argument (optional `Partial<T>`).
- `undefined` and `null` values are omitted automatically from the generated query string.

```typescript
type FilterQueryParams = {
  sort?: 'asc' | 'desc';
  page?: number;
  search?: string;
  isActive?: boolean;
};

const SEARCH_ROUTES = defineRouteConfig({
  CATALOG: defineRoute('catalog').withQueryParams<FilterQueryParams>(),
  ITEM_DETAILS: defineRoute('catalog/:itemId').withQueryParams<{ tab?: string; highlight?: boolean }>(),
});

export const { useRoutes: useSearchRoutes } = createRoutes(SEARCH_ROUTES);

// In a component:
const searchRoutes = useSearchRoutes();

// 1. Route without path parameters
searchRoutes.CATALOG({ search: 'react', page: 2 }).link;
// Result: "/catalog?search=react&page=2"

searchRoutes.CATALOG().link;
// Result: "/catalog"

// 2. Route with path parameters and query parameters
searchRoutes.ITEM_DETAILS({ itemId: 42 }, { tab: 'reviews', highlight: true }).link;
// Result: "/catalog/42?tab=reviews&highlight=true"
```

---

### Use Case 5: Inspecting Route Execution (`name`, `params`, `queryParams`)

Calling a route function returns metadata about the route invocation:

```typescript
const routeInfo = routes.DETAIL({ userId: '123' }, { tab: 'info' });

console.log(routeInfo.name);        // 'detail'
console.log(routeInfo.link);        // '/users/123?tab=info'
console.log(routeInfo.params);      // { userId: '123' }
console.log(routeInfo.queryParams); // { tab: 'info' }
```

---

### Use Case 6: Building Routes Without Navigation (`buildRoute`)

`buildRoute` allows manipulating routes, resolving URLs, and getting typed parameters/query parameters statically without requiring React hooks or navigation functions (`push`, `replace`). This is useful outside React components, in utilities, services, server-side code, or when generating links without navigation hooks:

```typescript
import { buildRoute } from 'typed-react-router-proxy';
import { userRoutes } from './users-routes.config';

// 1. Route without parameters
const listRoute = buildRoute(userRoutes.list);
console.log(listRoute.link); // "/users"

// 2. Route with path parameters
const detailRoute = buildRoute(userRoutes.detail, { userId: '123' });
console.log(detailRoute.link);   // "/users/123"
console.log(detailRoute.params); // { userId: '123' }

// 3. Route with path parameters and query parameters
const searchRoute = buildRoute(userRoutes.search, { query: 'john', page: 1 });
console.log(searchRoute.link);        // "/users/search?query=john&page=1"
console.log(searchRoute.queryParams); // { query: 'john', page: 1 }
```

---

## API Reference

### `defineRoute(path, options?)`

Creates a composable `RouteDefinition`.

- **`path`**: `string` - The path segment. Parameters can be specified using `:paramName`. Leading/trailing slashes are stripped automatically.
- **`options.parent`**: `RouteDefinition` *(optional)* - A parent route definition to inherit from.

### `defineRouteConfig(config)`

Helper function for route configuration objects. Ensures full TypeScript parameter inference for all route keys without manual generic casting.

### `createRoutes(config)`

Takes a route configuration and returns:

- **`useRoutes()`**: A React Hook returning a proxy object with callable route methods.
- **`routes`**: The original static `RouteDefinition` configuration object (for defining router trees and calculating relative paths).

### `buildRoute(route, ...args)`

Statically builds the URL and returns a route configuration object for a `RouteDefinition` with typed path and query parameters, without requiring navigation functions.

- **`route`**: `RouteDefinition` - The route definition to build.
- **`...args`**: Path parameters (if required) and query parameters (if defined).
- **Returns**: `StaticRouteConfig` (`{ link: string, params: Params, queryParams: QueryParams }`).

---

### `RouteDefinition` Methods & Properties

| Member | Type | Description |
| :--- | :--- | :--- |
| `relativePath` | `string` | The route's own path segment (e.g. `":userId"` or `"create"`). |
| `path(options?)` | `(options?: { relativeTo?: RouteDefinition }) => string` | Returns the resolved path string. If `relativeTo` is provided, stops at the specified ancestor. |
| `extend(nextPath)` | `(nextPath: string) => RouteDefinition` | Creates a child route segment inheriting parameters from the parent. |
| `withQueryParams<T>()` | `<T>() => RouteDefinition` | Attaches a TypeScript query parameter type to the route definition. |
| `format(...args)` | `(...args: BuildRouteArgs) => string` | Statically builds and returns the resolved URL string. |

---

### Static Route Object (`StaticRouteConfig`)

Returned by `buildRoute(route, ...args)`:

| Property | Type | Description |
| :--- | :--- | :--- |
| `link` | `string` | The complete URL string with path and query parameters resolved. |
| `params` | `Params \| undefined` | The path parameters passed to `buildRoute`. |
| `queryParams` | `QueryParams \| undefined` | The query parameters passed to `buildRoute`. |

---

### Route Proxy Invocation Object (`RouteConfig`)

When invoking a route on the proxy returned by `useRoutes()` (e.g., `routes.DETAIL(...)`), extends `StaticRouteConfig` with navigation methods:

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string \| number \| symbol` | Key of the route in the route config. |
| `link` | `string` | The complete URL string with path and query parameters resolved. |
| `params` | `Params \| undefined` | The path parameters passed to the route invocation. |
| `queryParams` | `QueryParams \| undefined` | The query parameters passed to the route invocation. |
| `push()` | `() => void` | Navigates to `link` using `navigate(link)`. |
| `replace()` | `() => void` | Navigates to `link` with `{ replace: true }`. |
