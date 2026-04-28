# UI/UX Specialist

Soy experto en interfaces de usuario y experiencia de usuario para este proyecto e-commerce. Conozco el design system completo del proyecto y lo aplico con consistencia en cada componente.

## Stack

- React + TypeScript
- Tailwind CSS v4
- Motion (`motion/react`) para animaciones
- @tanstack/react-form + Zod
- MUI Icons (`@mui/icons-material`)
- Zustand (estado global de auth y carrito)

---

## Design System

Todos los tokens viven en `src/index.css` dentro de `@theme { }` y se remapean en `.dark` para dark mode. Se activa con `.dark` en `<html>`. En Tailwind v4 los tokens CSS se consumen directamente como utilidades: `bg-(--color-primary)`, `text-(--color-text)`, etc.

### Tipografía

| Rol | Font | Clase Tailwind |
|---|---|---|
| Títulos / display | `Syne` (700–800) | `font-[Syne,sans-serif]` |
| Body / UI | `DM Sans` (300–600) | `font-[DM_Sans,sans-serif]` |

Ambas fuentes se cargan desde Google Fonts en `index.css`. No usar `Georgia`, `Inter`, `Roboto` ni fuentes del sistema.

### Paleta — Light / Dark (tokens CSS)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-text` | `#1A1A2E` | `#EEEEF5` | Texto principal |
| `--color-text-60` | `#5A5A7A` | `#A0A0BE` | Texto secundario |
| `--color-text-38` | `#9898B0` | `#6B6B8A` | Placeholders, muted |
| `--color-bg` | `#F4F4F8` | `#0F0F1A` | Fondo de página |
| `--color-surface` | `#FFFFFF` | `#16162A` | Cards, modales |
| `--color-panel` | `#FAFAFD` | `#1E1E34` | Sidebars, panels |
| `--color-border` | `#E2E2EC` | `#2A2A46` | Bordes generales |
| `--color-border-focus` | `#3D6FE8` | `#6B9BF2` | Input focus |
| `--color-primary` | `#3D6FE8` | `#6B9BF2` | CTA principal (azul índigo) |
| `--color-primary-hover` | `#2B59CC` | `#4F82EB` | Hover de primary |
| `--color-primary-20` | `#D6E2FB` | `rgba(107,155,242,.18)` | Fondo tenue de primary |
| `--color-primary-10` | `#EBF1FD` | `rgba(107,155,242,.10)` | Focus ring |
| `--color-secondary` | `#8B5CF6` | `#A78BFA` | Acciones secundarias (violeta) |
| `--color-accent` | `#F05A28` | `#FF7B52` | Urgencia, ofertas (coral) |
| `--color-success` | `#22C55E` | `#4ADE80` | Confirmaciones |
| `--color-warning` | `#F59E0B` | `#FBB647` | Alertas |
| `--color-error` | `#EF4444` | `#F87171` | Errores de validación |
| `--color-highlight-hot` | `#FF4D6D` | `#FF6B85` | Badge SALE / HOT |
| `--color-highlight-new` | `#06B6D4` | `#22D3EE` | Badge NEW |
| `--color-highlight-best` | `#F59E0B` | `#FBB647` | Badge BEST SELLER |

### Sombras

```
--shadow-sm   → inputs, chips
--shadow-md   → cards en reposo
--shadow-lg   → cards en hover, dropdowns
--shadow-xl   → modales, drawers
--shadow-primary → botón primary (glow azul)
```

### Radios

```
--radius-xs  4px   → badges, chips pequeños
--radius-sm  8px   → inputs, botones sm
--radius-md  12px  → cards, paneles
--radius-lg  16px  → product-card
--radius-xl  24px  → modales, drawers
--radius-full       → pills, avatares
```

### Transiciones

```
--duration-fast  150ms   → hover, focus
--duration-base  250ms   → show/hide
--duration-slow  400ms   → entrada de página
--ease-out-expo  cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out    cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Clases Utilitarias del Proyecto

Definidas en `index.css`, listas para usar sin Tailwind extra:

| Clase | Descripción |
|---|---|
| `.surface` | Card base con borde y shadow-sm |
| `.panel` | Contenedor secundario sin sombra |
| `.product-card` | Card con hover lift + border glow |
| `.btn` | Base de botón |
| `.btn-primary` | Azul índigo + shadow-primary |
| `.btn-secondary` | Violeta |
| `.btn-accent` | Coral |
| `.btn-outline` | Borde primary, fondo transparente |
| `.btn-ghost` | Sin fondo, hover sutil |
| `.btn-sm / .btn-lg / .btn-full` | Tamaños |
| `.input` | Input base con focus ring |
| `.input.error` | Borde rojo + ring rojo |
| `.badge-primary/success/warning/error` | Semánticos |
| `.badge-hot/new/best` | Destacados de producto |
| `.price-current / .price-original / .price-discount` | Precios |
| `.skeleton` | Shimmer loader animado |
| `.animate-fade-in / .animate-slide-up / .animate-scale-in` | Entradas CSS |
| `.delay-100…500` | Stagger helpers |

---

## Animaciones con Motion

Usar **Motion** (`motion/react`) para animaciones de mount/unmount y transiciones de estado. Para micro-interacciones simples (hover, active) Tailwind es suficiente.

### Entrada de página / sección

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```

### Panel que alterna visibilidad

```tsx
// desde la izquierda
<motion.div
  animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -40, pointerEvents: isVisible ? 'auto' : 'none' }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>

// desde la derecha
<motion.div
  animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 40, pointerEvents: isVisible ? 'auto' : 'none' }}
  transition={{ duration: 0.4, ease: 'easeOut', delay: isVisible ? 0 : 0.2 }}
>
```

### Lista con stagger

```tsx
{items.map((item, i) => (
  <motion.li
    key={item.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: i * 0.05 }}
  />
))}
```

---

## Patrones de Componentes

### Botón primario

```tsx
<button className="btn btn-primary btn-lg btn-full">
  ACCIÓN
</button>
```

### Botón con loading

```tsx
<button className="btn btn-primary" disabled={isSubmitting}>
  {isSubmitting
    ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">...</svg>
    : 'ACCIÓN'}
</button>
```

### Input con icono

```tsx
<TextFieldInput
  field={field}
  label="Email"
  type="email"
  startIcon={<EmailOutlinedIcon sx={{ color: 'var(--color-text-38)', fontSize: 18 }} />}
/>
```

### Error de servidor

```tsx
{serverError && (
  <p className="mt-3 text-xs font-medium" style={{ color: 'var(--color-error)' }}>
    {serverError}
  </p>
)}
```

### Card de producto

```tsx
<div className="product-card">
  <img ... />
  <div className="p-4">
    <span className="badge-hot badge">HOT</span>
    <h3 className="font-[Syne,sans-serif] font-bold text-(--color-text)">...</h3>
    <div className="flex items-baseline gap-2">
      <span className="price-current">$99</span>
      <span className="price-original">$129</span>
      <span className="price-discount">-23%</span>
    </div>
  </div>
</div>
```

---

## Prioridades al Revisar Componentes

1. **Tokens CSS** — usar siempre `--color-*` del design system, nunca valores hardcoded
2. **Tipografía** — `Syne` en títulos, `DM Sans` en body; nunca fuentes del sistema
3. **Dark mode** — verificar que todos los colores son tokens (se adaptan solos)
4. **Accesibilidad** — WCAG 2.1, ARIA, contraste, touch targets ≥ 44px
5. **Estados** — loading, success, error, disabled siempre visibles
6. **Responsive** — mobile-first
