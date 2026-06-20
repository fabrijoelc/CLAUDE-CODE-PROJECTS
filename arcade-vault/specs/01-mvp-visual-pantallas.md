# SPEC 01 — MVP visual de Arcade Vault

> **Estado:** implementado · **Depende de:** ninguna · **Fecha:** 2026-06-18
> **Objetivo:** Portar las cinco pantallas del template `references/templates` a Next.js 16 (App Router, React 19, Tailwind v4) como maqueta visual navegable, sin lógica de juego real.

---

## Alcance

**Dentro:**

- Cinco pantallas portadas como rutas reales del App Router:
  - `/` — Biblioteca (hero, buscador, filtros por categoría, grid de tarjetas).
  - `/juego/[id]` — Detalle del juego (portada, info, stats, leaderboard mock).
  - `/juego/[id]/jugar` — Reproductor (carcasa CRT animada, HUD, score auto-incremental, pausa, modal de fin).
  - `/auth` — Acceso (tabs iniciar sesión / crear cuenta, login mock, invitado, social falso).
  - `/salon` — Salón de la Fama (tabs por juego, podio, tabla de puntuaciones).
- Navbar global (logo, links, contador de créditos, botón sesión, panel móvil) y footer, en el layout raíz.
- Datos ficticios (catálogo de 8 juegos, categorías, generador de puntuaciones sembrado) en `app/data.ts`, como placeholder de lo que eventualmente vendrá de una base de datos.
- Estado de usuario compartido (login/logout) vía React Context en un provider del layout; persistencia de `av_user` y `av_scores` en localStorage.

**Ya existente (no es trabajo de este spec):**

- `app/globals.css` con el sistema visual completo (variables, neón, CRT, covers CSS, animaciones) ya migrado.
- `app/layout.tsx` ya carga las fuentes (`Press Start 2P`, `JetBrains Mono`, `Courier Prime`) vía `next/font` y monta `av-bg`, `av-noise` y `#root`.

**Fuera de alcance (para futuros specs):**

- Lógica real de cualquier juego (motor, controles, físicas, colisiones).
- Backend, base de datos, autenticación real, OAuth de Google/GitHub (los botones quedan decorativos).
- Puntuaciones reales del servidor o ranking persistente entre usuarios.
- Tests automatizados (no hay runner configurado).
- Optimización de navegación instantánea (`unstable_instant`) salvo que surja necesidad.

---

## Modelo de datos

No se introducen estructuras nuevas respecto al template. Se tipan en TypeScript las ya existentes en `data.jsx` y el estado persistido. Viven en `app/data.ts` como placeholder de una futura base de datos.

```ts
// app/data.ts
type GameColor = "cyan" | "magenta" | "yellow" | "green";

interface Game {
  id: string;          // "bloque-buster"
  title: string;       // "BLOQUE BUSTER"
  short: string;       // descripción corta (tarjeta)
  long: string;        // descripción larga (detalle)
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string;       // clase CSS de portada: "cover-bricks", etc.
  color: GameColor;    // color del botón JUGAR
  best: number;        // mejor puntuación global
  plays: string;       // partidas, ya formateado ("12.4K")
}

const GAMES: Game[];                 // 8 juegos del template
const CATS: string[];                // ["TODOS","ARCADE","PUZZLE","SHOOTER","VERSUS"]
function seededScores(seed: number, count?: number): ScoreRow[]; // generador determinista

interface ScoreRow { rank: number; name: string; score: number; date: string; }
```

```ts
// estado persistido en localStorage
// clave "av_user"   -> User | null
interface User { name: string; }            // p.ej. { name: "PX_KAI" }

// clave "av_scores" -> SavedScore[]
interface SavedScore { game: string; score: number; name: string; at: number; }
```

Convenciones:

- Puntuaciones se muestran con `toLocaleString("es-ES")`.
- Nombres de jugador en mayúsculas, máximo 10 caracteres.
- `seededScores` es determinista por `seed` — misma entrada, misma tabla (no se guarda).

---

## Plan de implementación

1. **Datos mock.** Crear `app/data.ts` con `Game`, `GAMES`, `CATS`, `seededScores` y tipo `ScoreRow`, portados desde `references/templates/data.jsx`. Verificación: `npm run build` compila sin errores de tipos.

2. **Contexto de usuario.** Crear `app/components/user-provider.tsx` (Client Component): Context con `user`, `login(user)`, `signOut()`, `saveScore(entry)`, hidratando desde `localStorage` (`av_user`, `av_scores`) en `useEffect` y persistiendo en cada cambio. Envolver `children` en `app/layout.tsx`. Verificación: la app sigue renderizando, sin errores de hidratación en consola.

3. **Navbar + footer.** Crear `app/components/nav.tsx` (Client, usa el contexto de usuario y `next/navigation` para links/activo) y el footer, montados en el layout. Reutilizan las clases existentes (`av-nav`, `btn`, etc.); lo complementario, con utilidades Tailwind. Verificación: navbar fija con logo, links, contador de créditos y botón de sesión; panel móvil abre/cierra a <840px.

4. **Biblioteca (`app/page.tsx`).** Hero + buscador + chips de categoría + grid de `GameCard` (con efecto tilt). Las tarjetas enlazan a `/juego/[id]`. Verificación: filtrar por texto y categoría actualiza el grid; estado vacío se muestra sin resultados.

5. **Detalle (`app/juego/[id]/page.tsx`).** Portada grande, tags, descripción larga, `stat-strip`, leaderboard con `seededScores`, botones "JUGAR AHORA" → `/juego/[id]/jugar` y "VOLVER AL VAULT" → `/`. Manejar `id` inexistente con `notFound()`. Verificación: cada tarjeta abre su detalle correcto.

6. **Reproductor (`app/juego/[id]/jugar/page.tsx`).** Copiar el "juego falso" del template tal cual, como placeholder: HUD (jugador, score, vidas, nivel), arena CRT animada, pausa, botón FIN, modal de fin con input de iniciales y "GUARDAR PUNTUACIÓN" (llama `saveScore`). Score auto-incremental con `setInterval`. Verificación: el score sube, pausa lo detiene, FIN abre el modal y guardar muestra el toast.

7. **Auth (`app/auth/page.tsx`).** Tabs iniciar sesión/crear cuenta, campos, login mock (`login({name})` → `/`), "JUGAR COMO INVITADO", botones sociales decorativos. Verificación: enviar el formulario inicia sesión y redirige; el navbar muestra el nombre.

8. **Salón (`app/salon/page.tsx`).** Tabs por juego, podio (top 3), tabla con animación de entrada, fila "TU MEJOR MARCA" si hay usuario. Verificación: cambiar de tab recarga podio y tabla; con sesión aparece la fila del jugador.

9. **Repaso de fidelidad.** Comparar cada pantalla contra su `.jsx`/`.html` de referencia y ajustar clases/markup divergentes. Si algún estilo no encaja, revisar `app/globals.css`. Verificación: las cinco rutas coinciden visualmente con el template y `npm run build` pasa limpio.

---

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] No hay errores ni warnings de hidratación en la consola al cargar cada ruta.
- [ ] `/` muestra hero, buscador, chips y grid de 8 tarjetas.
- [ ] Escribir en el buscador filtra las tarjetas por título; sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Pulsar una categoría filtra el grid; "TODOS" muestra los 8 juegos.
- [ ] Click en una tarjeta navega a `/juego/[id]` con el juego correcto.
- [ ] `/juego/[id]` muestra portada, tags, descripción larga, stat-strip y leaderboard de 10 filas.
- [ ] Un `id` inexistente en `/juego/[id]` devuelve 404.
- [ ] "JUGAR AHORA" navega a `/juego/[id]/jugar`; "VOLVER AL VAULT" navega a `/`.
- [ ] En el reproductor el score aumenta solo; "PAUSA" lo detiene y "REANUDAR" lo continúa.
- [ ] "FIN" abre el modal de fin de juego con la puntuación final.
- [ ] Guardar puntuación en el modal persiste en `av_scores` (localStorage) y muestra el toast "PUNTUACIÓN GUARDADA".
- [ ] `/auth` permite iniciar sesión (mock) y redirige a `/`; el navbar pasa a mostrar el nombre del usuario.
- [ ] "JUGAR COMO INVITADO" entra sin sesión y redirige a `/`.
- [ ] El usuario persiste en `localStorage` (`av_user`) tras recargar; cerrar sesión lo elimina.
- [ ] `/salon` muestra tabs por juego, podio (top 3) y tabla; cambiar de tab actualiza ambos.
- [ ] Con sesión iniciada, el salón muestra la fila "TU MEJOR MARCA".
- [ ] A <840px aparece el botón hamburguesa y el panel móvil abre/cierra.
- [ ] Las cinco pantallas coinciden visualmente con las referencias de `references/templates`.

---

## Decisiones

- **Sí:** rutas reales del App Router (`/`, `/juego/[id]`, `/juego/[id]/jugar`, `/auth`, `/salon`). Idiomático de Next 16, URLs compartibles, navegación con `<Link>`/`useRouter`.
- **No:** replicar el hash routing de `app.jsx`. Funciona, pero ignora el router de Next y rompe URLs profundas.
- **Sí:** reutilizar `app/globals.css` (ya migrado) con sus clases del template, y usar Tailwind v4 para todo lo complementario y para los `style={{}}` inline del template. El CSS neón/CRT/covers ya está portado; reescribirlo aporta riesgo sin beneficio.
- **No:** reescribir el sistema visual completo en utilidades Tailwind. Solo lo nuevo o puntual va en Tailwind.
- **Sí:** datos ficticios en `app/data.ts` como placeholder de la futura base de datos.
- **No:** ubicarlos en `lib/`. El equipo centraliza la maqueta en `app/`.
- **Sí:** estado de usuario en React Context dentro de un provider Client en el layout (`app/components/user-provider.tsx`). El navbar (global) y las páginas comparten `user` sin prop-drilling.
- **No:** librería de estado global (Zustand/Redux). Sobredimensionado para un único objeto `user` y un array de scores.
- **Sí:** persistencia en `localStorage` con claves `av_user` y `av_scores`, igual que el template. Cabe de sobra y no requiere consultas.
- **No:** versionar las claves de localStorage. Es una maqueta visual sin migraciones previstas; si el esquema cambia, se reescribe.
- **Sí:** copiar el "juego falso" del reproductor (arena CRT, score auto-incremental, modal) tal cual, como placeholder hasta que lleguen las pantallas de juegos reales.
- **No:** implementar lógica de juego real. Va en specs posteriores, uno por juego si llega.
- **Sí:** páginas con interactividad como Client Components (`"use client"`). Usan `useState`/efectos/eventos.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Desajuste de hidratación al leer `localStorage` en el render inicial (servidor no tiene `window`). | El provider inicia con estado neutro y lee `localStorage` dentro de `useEffect` tras montar; nunca durante el render del servidor. |
| `localStorage` deshabilitado (modo privado) lanza excepción. | Envolver lecturas/escrituras en `try/catch`, igual que el template; la app sigue funcionando sin persistir. |
| `setInterval` del score sigue activo al desmontar el reproductor o navegar fuera. | Limpiar el intervalo en el cleanup del `useEffect` y al pausar/terminar. |
| Estilos del template que no encajen al portar el markup a JSX/Tailwind. | `app/globals.css` ya contiene las clases; revisar y ajustar ahí en el paso de repaso de fidelidad. |

---

## Lo que **no** entra en este spec

- Lógica real de cualquier juego (motor, controles, físicas, colisiones).
- Backend, base de datos y autenticación real; OAuth de Google/GitHub (botones decorativos).
- Puntuaciones de servidor o ranking compartido entre usuarios reales.
- Tests automatizados.
- Optimización de navegación instantánea (`unstable_instant`).

Cada uno de ellos, si llega, va en su propio spec.
