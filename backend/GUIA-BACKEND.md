# Guía paso a paso: cómo iniciar un backend Node.js + TypeScript

Esta guía describe, de forma **general** (sin atarse a ningún dominio concreto como
e-commerce, blog, etc.), cómo montar un backend profesional con el mismo stack y las
mismas decisiones de arquitectura que este proyecto. Sirve como plantilla reutilizable
para arrancar cualquier API REST.

## Stack que vamos a montar

| Pieza | Tecnología | Para qué |
|-------|-----------|----------|
| Lenguaje | **TypeScript** | Tipado estático, menos bugs en runtime |
| Framework HTTP | **Express 5** | Enrutado y middlewares (maneja errores async nativamente) |
| ORM / DB | **Prisma 7** + **PostgreSQL** | Modelado de datos y acceso tipado a la BD |
| Validación | **Zod** | Validar input de usuario **y** variables de entorno |
| Autenticación | **JWT** (`jsonwebtoken`) + **bcrypt** | Login con token en cookie httpOnly |
| Logging | **Pino** + **pino-http** | Logs estructurados y por-request |
| Seguridad | **helmet**, **cors**, **express-rate-limit** | Cabeceras seguras, CORS y anti fuerza bruta |
| Tests | **Jest** + **ts-jest** + **Supertest** | Tests de integración sobre la app Express |
| Dev tooling | **ts-node**, **nodemon**, **ESLint** | Recarga en caliente y linting |

> **Por qué Express (y no otro framework):** elegir framework es una decisión de
> *contexto*, no un default. Aquí usamos **Express 5** por la madurez de su ecosistema,
> la cantidad de middleware disponible y porque ya maneja errores `async` de forma
> nativa. Si tu caso fuera otro, la decisión cambiaría:
> - **Edge / serverless** (Cloudflare, Vercel) → **Hono** (cero dependencias, arranque en frío ultrarrápido).
> - **API de alto rendimiento** → **Fastify** (2-3× más rápido que Express).
> - **Equipo grande / enterprise** → **NestJS** (estructura, DI, decoradores).
>
> Pregúntate siempre: ¿cuál es el destino de despliegue?, ¿importa el arranque en frío?,
> ¿qué conoce ya el equipo?

---

## Paso 1 — Inicializar el proyecto

```bash
mkdir mi-backend && cd mi-backend
npm init -y
git init
```

Crea un `.gitignore` desde el principio:

```gitignore
node_modules/
dist/
coverage/
.env
generated/        # cliente de Prisma generado
*.log
```

> **Regla de oro:** nunca subas `.env` ni la carpeta `generated/` al repositorio.

---

## Paso 2 — TypeScript

```bash
npm install -D typescript ts-node @types/node nodemon
npx tsc --init
```

`tsconfig.json` recomendado (modo estricto + outputs útiles):

```jsonc
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "commonjs",
    "target": "es2016",
    "types": ["node"],

    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Tipado más estricto
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

> **Nota sobre el sistema de módulos:** este proyecto usa **CommonJS** (`"module":
> "commonjs"`) por compatibilidad con `ts-node` y el ecosistema existente. Para un
> proyecto nuevo desde cero, el estándar moderno es **ESM** (`import`/`export`), que
> mejora el tree-shaking y la carga asíncrona de módulos. No es obligatorio cambiarlo,
> pero es una decisión consciente, no un accidente.

---

## Paso 3 — Estructura de carpetas (arquitectura modular)

La idea central: **cada dominio del negocio es un módulo** con sus propias capas. Esto
hace que el proyecto escale sin convertirse en un caos de archivos.

```
src/
├── index.ts                 # Arranque del servidor (listen, shutdown, señales)
├── app.ts                   # Construcción de la app Express (middlewares + rutas)
├── lib/                     # Infraestructura compartida
│   ├── config.ts            # Validación de variables de entorno (Zod)
│   ├── logger.ts            # Logger Pino
│   ├── prisma.ts            # Cliente Prisma (singleton)
│   ├── AppError.ts          # Clase de error de aplicación
│   └── utils.ts             # Helpers genéricos
├── middlewares/
│   ├── errorHandler.ts      # Manejo centralizado de errores
│   ├── authMiddleware.ts    # Verificación de JWT / roles
│   ├── rateLimiters.ts      # Límites de peticiones
│   └── httpLogger.ts        # Log por petición
└── modules/
    └── <dominio>/           # p. ej. auth, users, products...
        ├── routers/         # Define las rutas y a qué controller llaman
        ├── controllers/     # Capa HTTP: lee req, valida, llama al service, responde
        ├── services/        # Lógica de negocio + acceso a BD (Prisma)
        └── schemas/         # Esquemas Zod (validación + tipos derivados)
```

**Flujo de una petición:**

```
HTTP → router → controller → service → Prisma → PostgreSQL
                    │            │
                  valida      lógica de
                  (Zod)       negocio
```

- **Router**: solo mapea verbo+ruta → función del controller. Aquí se enchufan
  middlewares (auth, validación).
- **Controller**: capa fina. Parsea/valida el `body`/`params`, llama al service y
  devuelve la respuesta. **No** contiene lógica de negocio.
- **Service**: el "cerebro". Habla con Prisma, aplica reglas, lanza `AppError`.
- **Schema (Zod)**: define la forma del input y **deriva los tipos TypeScript** con
  `z.infer`, evitando duplicar tipos.

> Por qué separar así: el controller no sabe de BD y el service no sabe de HTTP. Puedes
> testear la lógica sin levantar Express, y cambiar de framework sin tocar el negocio.

---

## Paso 4 — Configuración validada (`lib/config.ts`)

Antes de arrancar nada, valida las variables de entorno. Si falta una o tiene formato
incorrecto, el proceso **falla rápido** con un mensaje claro en lugar de explotar más
tarde con un error confuso.

```bash
npm install dotenv zod
```

```typescript
// src/lib/config.ts
import 'dotenv/config';
import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
});

export type Config = z.infer<typeof envSchema>;
export { envSchema };

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

// Objeto congelado: el resto de la app consume `config`, nunca `process.env`.
export const config: Readonly<Config> = Object.freeze(parsed.data);
```

Crea un `.env.example` (este **sí** se sube al repo, como documentación):

```bash
PORT=3001
DATABASE_URL=""
# Genera un secreto fuerte:
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=""
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL="info"
```

> **Ventaja:** el resto del código usa `config.PORT` (tipado `number`) en lugar de
> `process.env.PORT` (`string | undefined` y a rezar). Una sola fuente de verdad.

---

## Paso 5 — Logger (`lib/logger.ts`)

```bash
npm install pino pino-http
npm install -D pino-pretty
```

```typescript
// src/lib/logger.ts
import pino from 'pino';
import { config } from './config';

const isTest = config.NODE_ENV === 'test';
const isProduction = config.NODE_ENV === 'production';
const level = isTest ? 'silent' : config.LOG_LEVEL;

// JSON en producción (parseable por agregadores), bonito en desarrollo,
// silencioso en tests para no ensuciar la salida.
export const logger =
  isProduction || isTest
    ? pino({ level }, pino.destination({ sync: true }))
    : pino({
        level,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      });
```

Y el middleware que añade un log y un `request-id` por cada petición:

```typescript
// src/middlewares/httpLogger.ts
import pinoHttp from 'pino-http';
import { logger } from '../lib/logger';

export const httpLogger = pinoHttp({
  logger,
  autoLogging: { ignore: req => req.url === '/health' }, // no logear las sondas de salud
});
```

---

## Paso 6 — Base de datos con Prisma (`lib/prisma.ts`)

```bash
npm install @prisma/client @prisma/adapter-pg pg
npm install -D prisma @types/pg
npx prisma init --datasource-provider postgresql
```

Define tu esquema en `prisma/schema.prisma`. Ejemplo **genérico** con un modelo `User`
(que casi todo backend necesita) y un modelo de dominio cualquiera:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"   // se genera fuera de src/
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  admin
  user
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(user)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Crea el cliente como **singleton** para no abrir conexiones de más:

```typescript
// src/lib/prisma.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { config } from './config';

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

Aplica la primera migración y genera el cliente:

```bash
npx prisma migrate dev --name init   # crea las tablas y genera el cliente
npx prisma studio                     # GUI para inspeccionar la BD (opcional)
```

---

## Paso 7 — Errores: clase propia + handler centralizado

Una sola clase para errores "esperados" del negocio:

```typescript
// src/lib/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

Un **único** middleware al final de la cadena que traduce cualquier error a una
respuesta HTTP coherente. Distingue errores de Zod (400), de Prisma (409/404/...),
los `AppError` (status personalizado) y cae a 500 para lo desconocido:

```typescript
// src/middlewares/errorHandler.ts
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Validación Zod → 400
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', issues: error.issues });
    return;
  }

  // 2. Errores conocidos de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': res.status(409).json({ error: 'Already exists' }); return;
      case 'P2025': res.status(404).json({ error: 'Record not found' }); return;
      case 'P2003': res.status(409).json({ error: 'Related record not found' }); return;
    }
  }

  // 3. Errores de negocio
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  // 4. Lo desconocido → 500 (y se logea con el request-id)
  (req.log ?? logger).error({ err: error }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
};
```

> **Clave de Express 5:** maneja automáticamente las promesas rechazadas de los
> handlers `async`, así que **no necesitas `try/catch` en cada controller**. Un
> `throw new AppError(...)` dentro de un service llega solito a este middleware.

**Dos refinamientos a considerar:**

1. **Código de error legible por máquina.** Las respuestas de arriba devuelven solo
   `{ error: message }`. Para que el frontend pueda reaccionar de forma programática
   (sin parsear el texto), conviene añadir un `code` estable:
   `res.status(409).json({ error: 'Already exists', code: 'DUPLICATE' })`. El mensaje
   es para humanos; el `code` es para el código.

2. **400 vs 422.** Usa **400** cuando el input no respeta el *esquema* (lo que captura
   Zod). Reserva **422** para input con esquema válido pero que **viola una regla de
   negocio** (p. ej. "el cupón ya expiró"): ahí lanza `throw new AppError('Coupon
   expired', 422)`.

---

## Paso 8 — Seguridad y middlewares transversales

```bash
npm install helmet cors compression cookie-parser express-rate-limit
npm install -D @types/cors @types/compression @types/cookie-parser
```

Rate limiting (límite suave general + límite estricto para login):

```typescript
// src/middlewares/rateLimiters.ts
import rateLimit from 'express-rate-limit';
import { config } from '../lib/config';

const skipInTest = () => config.NODE_ENV === 'test';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 300,
  standardHeaders: true, legacyHeaders: false, skip: skipInTest,
  message: { error: 'Too many requests, please try again later' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,   // mucho más estricto: anti fuerza bruta
  standardHeaders: true, legacyHeaders: false, skip: skipInTest,
  message: { error: 'Too many attempts, please try again later' },
});
```

---

## Paso 9 — Autenticación (JWT en cookie httpOnly)

```bash
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

Middleware que verifica el token y expone `req.user`, más un guard de rol:

```typescript
// src/middlewares/authMiddleware.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/AppError';
import { config } from '../lib/config';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string; role: string };
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies.token as string | undefined;
  if (!token) throw new AppError('Authentication required', 401);
  try {
    req.user = jwt.verify(token, config.JWT_SECRET) as { userId: string; role: string };
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') throw new AppError('Unauthorized', 403);
  next();
};
```

> **bcrypt bloquea el event loop si lo usas mal.** Hashear es una operación
> **CPU-bound** (intencionadamente costosa). Usa **siempre la API asíncrona**
> (`await bcrypt.hash(...)` / `await bcrypt.compare(...)`), que delega el trabajo al
> *thread pool* de libuv y no congela el bucle de eventos. **Nunca** uses las variantes
> `hashSync` / `compareSync` en código de producción: bloquearían todas las demás
> peticiones mientras calculan.

**Patrón de auth típico:**
1. **Register**: hashea la contraseña con `await bcrypt.hash(password, 10)` y guarda el usuario.
2. **Login**: verifica con `bcrypt.compare`, firma un JWT (`expiresIn: '7d'`) y lo manda
   como **cookie httpOnly** (no accesible por JS → resistente a XSS).
3. **Rutas protegidas**: el middleware `authenticate` extrae y verifica el JWT.
4. **Logout**: borra la cookie.

```typescript
// Opciones de cookie reutilizables (controller de auth)
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production', // solo HTTPS en prod
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
```

> **Nunca** devuelvas el campo `password` en las respuestas. En los `service`, usa
> `select` de Prisma o desestructura: `const { password: _, ...rest } = user;`.

---

## Paso 10 — Anatomía de un módulo

Ejemplo genérico de un módulo `users`. Replica esta estructura para cada dominio.

```typescript
// src/modules/users/schemas/userSchema.ts
import z from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

```typescript
// src/modules/users/services/userService.ts  (lógica + BD)
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../lib/AppError';
import { CreateUserInput } from '../schemas/userSchema';

const create = async (data: CreateUserInput) => {
  const user = await prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return user;
};

const getById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export default { create, getById };
```

```typescript
// src/modules/users/controllers/userController.ts  (capa HTTP)
import { Request, Response } from 'express';
import { CreateUserSchema } from '../schemas/userSchema';
import userService from '../services/userService';

export const create = async (req: Request, res: Response) => {
  const data = CreateUserSchema.parse(req.body);   // valida (lanza ZodError → 400)
  const user = await userService.create(data);
  res.status(201).json({ user });
};
```

```typescript
// src/modules/users/routers/userRouter.ts
import express from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../../../middlewares/authMiddleware';

const router = express.Router();
router.post('/', userController.create);
router.get('/me', authenticate, userController.getById);   // ruta protegida
export default router;
```

---

## Paso 11 — Construir la app (`app.ts`)

Separa la **construcción** de la app (`app.ts`) del **arranque** del servidor
(`index.ts`). Así puedes importar `app` en los tests sin levantar un puerto.

```typescript
// src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { config } from './lib/config';
import { prisma } from './lib/prisma';
import { errorHandler } from './middlewares/errorHandler';
import { authLimiter, generalLimiter } from './middlewares/rateLimiters';
import { httpLogger } from './middlewares/httpLogger';
import userRouter from './modules/users/routers/userRouter';
// ...otros routers

const app = express();

// 1. Middlewares globales (el orden importa)
app.use(httpLogger);                                              // log por request
app.use(helmet());                                               // cabeceras seguras
app.use(cors({ origin: config.FRONTEND_URL, credentials: true })); // CORS + cookies
app.use(compression());                                          // gzip
app.use(express.json({ limit: '1mb' }));                         // parsea JSON (con tope)
app.use(cookieParser());                                         // parsea cookies

// 2. Health check (para load balancers / orquestadores)
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

// 3. Rate limiting (general + estricto en auth)
app.use('/api', generalLimiter);
// El login y el registro son los dos vectores de fuerza bruta: protégelos ambos.
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Rutas de la API
app.use('/api/users', userRouter);
// app.use('/api/auth', authRouter); ...

// 5. Manejador de errores: SIEMPRE el último middleware
app.use(errorHandler);

export default app;
```

---

## Paso 12 — Arranque y apagado limpio (`index.ts`)

```typescript
// src/index.ts
import { config } from './lib/config';   // primero: valida env y falla rápido
import app from './app';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on http://localhost:${config.PORT}`);
});

// Apagado elegante: deja de aceptar peticiones, cierra la BD y sale.
const SHUTDOWN_TIMEOUT_MS = 10_000;
let shuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    await new Promise<void>((resolve, reject) =>
      server.close(err => (err ? reject(err) : resolve())),
    );
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
process.on('unhandledRejection', reason => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
  void gracefulShutdown('unhandledRejection');
});
process.on('uncaughtException', err => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
```

> **Por qué importa:** en producción (Docker/Kubernetes) tu proceso recibe `SIGTERM`
> al desplegar. Un apagado limpio termina las peticiones en vuelo y cierra la BD sin
> dejar conexiones colgadas.

---

## Paso 13 — Scripts de npm

```jsonc
// package.json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "seed": "npx prisma migrate reset && ts-node prisma/seed.ts"
  }
}
```

---

## Paso 14 — Tests (Jest + Supertest)

```bash
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

`jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  resetMocks: true,
  collectCoverageFrom: [
    'src/modules/**/*.ts',
    'src/lib/**/*.ts',
    'src/middlewares/**/*.ts',
    '!src/**/*.test.ts',
  ],
  // Umbrales para que las regresiones rompan CI
  coverageThreshold: {
    global: { statements: 85, branches: 55, functions: 85, lines: 85 },
  },
};
```

`src/tests/setup.ts` (inyecta env de test antes de importar la app):

```typescript
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV = 'test';
```

Patrón de test de integración: se **mockea Prisma** y se prueba la app entera con
Supertest (sin BD real):

```typescript
import request from 'supertest';
import app from '../app';

jest.mock('../lib/prisma', () => ({
  prisma: { user: { create: jest.fn(), findUnique: jest.fn() } },
}));
import { prisma } from '../lib/prisma';

describe('POST /api/users', () => {
  it('crea un usuario y devuelve 201', async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com' });

    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'a@b.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('devuelve 400 con email inválido', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'no-email', password: 'password123' });
    expect(res.status).toBe(400);
  });
});
```

> **Ventaja de mockear Prisma:** tests rápidos y deterministas que no necesitan una BD
> levantada. Se prueba toda la cadena (router → controller → service → errorHandler).

---

## Paso 15 — Linting (opcional pero recomendado)

```bash
npm install -D eslint @eslint/js typescript-eslint
```

`eslint.config.mjs`:

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ['dist/', 'generated/', 'coverage/'] },
);
```

---

## Checklist de arranque rápido

```bash
# 1. Crear proyecto e instalar todo
npm init -y && git init
npm install express zod dotenv pino pino-http helmet cors compression \
  cookie-parser express-rate-limit jsonwebtoken bcrypt \
  @prisma/client @prisma/adapter-pg pg
npm install -D typescript ts-node nodemon @types/node @types/express \
  @types/cors @types/compression @types/cookie-parser @types/jsonwebtoken \
  @types/bcrypt @types/pg prisma jest ts-jest @types/jest supertest \
  @types/supertest pino-pretty eslint @eslint/js typescript-eslint

# 2. Configurar TS, Prisma y .env
npx tsc --init
npx prisma init --datasource-provider postgresql
cp .env.example .env   # y rellenar DATABASE_URL y JWT_SECRET

# 3. Crear la estructura src/ (Pasos 3–12)

# 4. Migrar la BD y arrancar
npx prisma migrate dev --name init
npm run dev
```

---

## Principios de diseño que hacen este backend sólido

1. **Falla rápido**: la config se valida al arrancar; si algo falta, el proceso no
   levanta. Mejor un crash claro al inicio que un bug silencioso en producción.
2. **Una sola fuente de verdad**: `config` para el entorno, schemas Zod para los tipos
   de input (`z.infer`), no duplicar.
3. **Separación de capas**: HTTP (controller) ≠ negocio (service) ≠ datos (Prisma).
4. **Errores centralizados**: un único `errorHandler`; los services solo lanzan
   `AppError` y dejan que burbujee.
5. **Seguridad por defecto**: helmet, CORS restringido, rate limiting, cookies
   httpOnly, contraseñas hasheadas, `password` nunca en las respuestas.
6. **Observabilidad**: logs estructurados con request-id, health check para
   orquestadores.
7. **Apagado elegante**: maneja señales del SO para no perder peticiones en despliegues.
8. **Testeable**: `app` separada del `listen`, Prisma mockeable, umbrales de cobertura.

> Este esqueleto es independiente del dominio: para construir cualquier API solo añades
> módulos nuevos en `src/modules/` siguiendo el patrón router → controller → service →
> schema. La infraestructura (`lib/`, `middlewares/`, `app.ts`, `index.ts`) no cambia.
