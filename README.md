# Ecommerce

Aplicación de e-commerce full-stack construida como monorepo: SPA en React 19 + backend en Express 5 con PostgreSQL/Prisma, autenticación con JWT y pagos con Stripe Checkout.

Incluye catálogo de productos con categorías, carrito, lista de deseos, direcciones de envío, checkout con pago real (Stripe), historial de pedidos y un panel de administración de productos/pedidos.

## Stack

| | |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite 7, MUI + Tailwind v4, React Router v7, TanStack Query + Form, Zustand, Zod, axios |
| **Backend** | Node.js, TypeScript, Express 5, Prisma ORM, PostgreSQL, JWT (cookie httpOnly), Zod, pino |
| **Pagos** | Stripe Checkout + webhooks |
| **Deploy** | Frontend en Netlify · Backend en Fly.io (Docker) · DB en Neon |
| **Tests** | Jest + Supertest (backend) |

Cada parte tiene su propio README con el detalle de arquitectura, convenciones y flujos:

- [`backend/README.md`](backend/README.md) — API REST, módulos, base de datos, flujo de auth y de pagos, deploy en Fly.io
- [`frontend/README.md`](frontend/README.md) — arquitectura feature-sliced, routing, estado, convenciones, deploy en Netlify
- [`GUIA_INTEGRACION_STRIPE.md`](GUIA_INTEGRACION_STRIPE.md) — guía de la integración de Stripe Checkout end-to-end

## Funcionalidades

- Autenticación (registro / login / logout) con JWT en cookie httpOnly
- Catálogo de productos con categorías, búsqueda y filtros
- Carrito de compra persistente
- Lista de deseos (wishlist)
- Gestión de direcciones de envío
- Checkout con Stripe Checkout (flujo de redirect) y confirmación vía webhook
- Historial y detalle de pedidos, cancelación
- Panel de administración: gestión de productos y estados de pedidos (rutas protegidas por rol)

## Estructura del repo

```
ecommerce/
├── backend/     # API REST (Express + Prisma + PostgreSQL)
├── frontend/    # SPA (React + Vite)
└── GUIA_INTEGRACION_STRIPE.md
```

## Puesta en marcha (desarrollo local)

Requisitos: Node.js 20+, PostgreSQL en ejecución y una cuenta de Stripe (modo test).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # completar variables (ver backend/README.md)
npx prisma migrate dev
npm run seed               # opcional: datos de ejemplo
npm run dev                 # http://localhost:3001

# 2. Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env      # completar variables (ver frontend/README.md)
npm run dev                 # http://localhost:5173, proxya /api al backend
```

Detalle completo de variables de entorno, scripts, migraciones y arquitectura en el README de cada carpeta.

## Deploy

- **Backend**: Fly.io como contenedor Docker (`backend/Dockerfile`, `backend/fly.toml`), con PostgreSQL gestionado en Neon. Migraciones aplicadas automáticamente en cada release.
- **Frontend**: Netlify como sitio estático, con `/api/*` proxyado same-origin hacia el backend (necesario por la cookie de sesión `SameSite=Lax`).

Detalles en [`backend/README.md`](backend/README.md#deploy) y [`frontend/README.md`](frontend/README.md#deploy).
