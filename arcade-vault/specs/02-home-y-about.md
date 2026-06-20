# SPEC 02 — Home (landing) y Acerca de

> **Estado:** Implementado · **Depende de:** SPEC 01 · **Fecha:** 2026-06-18
> **Objetivo:** Portar las pantallas Home (landing) y Acerca de del template `references/templates/home-about` a rutas reales de Next 16, moviendo Biblioteca a `/biblioteca` para que `/` sea la landing.

---

## Alcance

**Dentro:**

- Nueva ruta **`/`** = Home (landing), Client Component (`app/page.tsx` reescrito). Secciones del template: hero con siluetas pixel flotantes y eyebrow "INSERTA UNA MONEDA", "¿POR QUÉ ARCADE VAULT?" (4 feature cards con iconos SVG), "JUEGOS DISPONIBLES AHORA" (rail de `GAMES.slice(0,6)`), bloque de stats, "ACTIVIDAD EN VIVO" (ticker + top jugadores), "PRECIOS" (price card + FAQ) y CTA final. Reveal-on-scroll con `IntersectionObserver`.
- Biblioteca **movida** a `/biblioteca` (nuevo `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx`, sin cambios de lógica).
- Nueva ruta **`/about`** = Acerca de + Contacto (`app/about/page.tsx`, Client Component): misión, highlight-row, divider animado y formulario de contacto **mock** (valida campos, shake si faltan, animación terminal "MENSAJE RECIBIDO").
- Nav actualizado a 4 links (Inicio `/`, Biblioteca `/biblioteca`, Salón `/salon`, Acerca de `/about`) en barra y panel móvil; logo → `/`; `isActive` reajustado.
- Repunte de enlaces "volver a Biblioteca" de `/` a `/biblioteca`: `salon/page.tsx:105`, `juego/[id]/page.tsx:49`, `juego/[id]/jugar/page.tsx:138`.
- Portar a `app/globals.css` los ~27 bloques de CSS de home/about del template `styles.css` que aún no existen.

**Fuera de alcance (para futuros specs):**

- Conectar ticker/top jugadores/stats del Home con datos reales (`seededScores`/`av_scores`); quedan hardcodeados como en el template.
- Envío real del formulario de contacto (backend, email); queda mock.
- Lógica real de juegos, autenticación real, OAuth (heredado de SPEC 01).
- Tests automatizados (no hay runner).
- Optimización de navegación instantánea (`unstable_instant`) salvo necesidad.

---

## Modelo de datos

Esta feature **no introduce estructuras de datos persistentes nuevas**. Reutiliza `Game`, `GAMES` y los tipos de `app/data.ts` (SPEC 01).

Los contenidos del Home y Acerca de son literales inline en el componente, no estructuras compartidas:

```ts
// app/page.tsx (Home) — arrays locales, no exportados
const FEATURES: { i: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET"; t: string; d: string; c: GameColor }[];
const STATS:    { n: string; u: string; s: string }[];
const TICKER:   { p: string; g: string; s: number; t: string; c: GameColor }[];
const TOP:      { r: number; p: string; s: number }[];
const FAQ:      { q: string; a: string }[];

// El rail de juegos sí tira del modelo existente:
GAMES.slice(0, 6);

// app/about/page.tsx (Contacto) — estado local del form, no persiste
const [form, setForm] = useState({ name: "", email: "", msg: "" });
const [sent, setSent] = useState<string | null>(null);
const [shake, setShake] = useState(false);
```

Convenciones (heredadas de SPEC 01):

- Puntuaciones con `toLocaleString("es-ES")`.
- Nombres de jugador en mayúsculas.
- `GameColor = "cyan" | "magenta" | "yellow" | "green"`.

---

## Plan de implementación

1. **CSS de home/about.** Portar a `app/globals.css` los bloques que faltan del template `references/templates/home-about/styles.css` (`home-hero`, `home-silos`/`silo`, `feature-grid`/`feature-card`, `ft-icon`, `mini-rail`/`mini-card`, `home-stats`/`stat-block`, `activity-grid`/`ticker`/`tick-row`/`top-list`/`top-row`, `pricing-grid`/`price-card`/`pricing-faq`/`faq-item`, `home-final`, `about-hero`/`about-mission`, `highlight-row`/`highlight`/`hl-icon`, `about-divider`, `about-contact`/`contact-grid`/`contact-form`/`field`/`terminal-success`, `reveal`/`.in`, etc.). Verificación: `npm run build` compila; las clases existentes no se duplican ni rompen.

2. **Mover Biblioteca a `/biblioteca`.** Crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx` (sin cambios de lógica). Verificación: `/biblioteca` renderiza hero, buscador, chips y grid igual que antes.

3. **Home en `/`.** Reescribir `app/page.tsx` como Client Component portando `home.jsx`: hero + `FloatingSilhouettes`, features, rail (`GAMES.slice(0,6)` → `/juego/[id]`), stats, actividad, precios, CTA final. Botones navegan con `useRouter`/`<Link>` (EXPLORAR JUEGOS → `/biblioteca`, CREAR CUENTA/EMPEZAR → `/auth`, VER SALÓN → `/salon`). `useReveal` con `IntersectionObserver` en `useEffect`. Verificación: `/` muestra todas las secciones y los CTAs navegan correcto; el reveal anima al hacer scroll.

4. **Acerca de en `/about`.** Crear `app/about/page.tsx` (Client) portando `about.jsx`: misión, highlights, divider y formulario mock (validación, shake, animación terminal, "ENVIAR OTRO MENSAJE" resetea). `useReveal` igual que el Home. Verificación: enviar con campos vacíos hace shake; con campos llenos muestra la terminal de éxito con el nombre.

5. **Nav a 4 links.** Actualizar `app/components/nav.tsx`: links Inicio `/`, Biblioteca `/biblioteca`, Salón `/salon`, Acerca de `/about` (barra y panel móvil); logo → `/`; `isActive("/")` solo `pathname === "/"`, `isActive("/biblioteca")` cubre `/biblioteca` y `/juego/*`. Verificación: cada link marca activo en su ruta; el detalle/jugar mantiene activo "Biblioteca".

6. **Repunte de enlaces "volver a Biblioteca".** Cambiar `/` → `/biblioteca` en `salon/page.tsx:105`, `juego/[id]/page.tsx:49`, `juego/[id]/jugar/page.tsx:138`. (Login e invitado en `auth/page.tsx` se quedan en `/`.) Verificación: "VOLVER AL VAULT" y equivalentes llevan a `/biblioteca`; login/invitado llevan a Home.

7. **Repaso de fidelidad.** Comparar Home y Acerca de contra `home.jsx`/`about.jsx`/`styles.css` y ajustar markup/clases divergentes. Verificación: ambas pantallas coinciden con el template y `npm run build` + `npm run lint` pasan limpio.

---

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] No hay errores ni warnings de hidratación en consola al cargar `/`, `/biblioteca` y `/about`.
- [ ] `/` muestra hero con siluetas, las 4 feature cards, el rail de 6 juegos, stats, actividad (ticker + top), precios (card + FAQ) y CTA final.
- [ ] Al hacer scroll en `/`, las secciones `.reveal` animan su entrada (clase `in`).
- [ ] En `/`, "EXPLORAR JUEGOS" e "INSERTAR MONEDA →" navegan a `/biblioteca`; "CREAR CUENTA"/"EMPEZAR GRATIS" a `/auth`; "VER SALÓN →" a `/salon`; una mini-card navega a `/juego/[id]`.
- [ ] `/biblioteca` muestra hero, buscador, chips y grid de 8 tarjetas, con el mismo comportamiento que tenía en `/` (filtro por texto y categoría, estado vacío).
- [ ] `/about` muestra misión, highlight-row, divider y el formulario de contacto.
- [ ] Enviar el formulario con algún campo vacío dispara el shake y no muestra éxito.
- [ ] Enviar con los tres campos llenos muestra la terminal "MENSAJE RECIBIDO" con el nombre en mayúsculas; "ENVIAR OTRO MENSAJE" limpia el form.
- [ ] El nav muestra 4 links (Inicio, Biblioteca, Salón de la Fama, Acerca de) en barra y panel móvil; el logo lleva a `/`.
- [ ] El link activo del nav corresponde a la ruta actual; en `/juego/*` queda activo "Biblioteca".
- [ ] "VOLVER AL VAULT" (detalle), el botón de salir del jugar y el botón de `/salon` navegan a `/biblioteca`.
- [ ] Login mock e "JUGAR COMO INVITADO" siguen redirigiendo a `/` (Home).
- [ ] A <840px aparece el hamburguesa y el panel móvil abre/cierra con los 4 links.
- [ ] Home y Acerca de coinciden visualmente con `references/templates/home-about`.

---

## Decisiones

- **Sí:** `/` pasa a ser Home y Biblioteca se mueve a `/biblioteca`. Es lo que asume el template (logo e "Inicio" → landing, "Biblioteca" como link propio); una landing en la raíz es lo idiomático.
- **No:** dejar `/` como Biblioteca y poner el Home en `/inicio`. Ensucia la URL de la landing y contradice el nav del template.
- **Sí:** Acerca de en `/about`. Ruta corta y estándar.
- **No:** `/acerca-de`. Más largo sin ganancia.
- **Sí:** formulario de contacto mock (validación + animación terminal), igual que el template. Es una maqueta visual.
- **No:** backend/email real. Va en otro spec si llega.
- **Sí:** ticker, top jugadores, stats y pricing hardcodeados como en el template. Mantiene la paridad visual sin acoplar a datos reales.
- **No:** alimentar el Home desde `seededScores`/`av_scores`. Integración con datos reales es otro spec.
- **Sí:** login e invitado siguen redirigiendo a `/` (ahora Home). El usuario aterriza en la landing ya logueado.
- **No:** redirigir login a `/biblioteca`. Esconde la landing recién portada.
- **Sí:** Home y Acerca de como Client Components. Usan `IntersectionObserver`, estado y eventos.
- **Sí:** copiar el contenido de Biblioteca tal cual a `app/biblioteca/page.tsx` sin refactor. Minimiza el riesgo del movimiento de ruta.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `IntersectionObserver` no existe en SSR (`window`/`document` undefined). | Instanciarlo dentro de `useEffect` (solo cliente), nunca en render; limpiar con `io.disconnect()` en el cleanup. |
| Al portar CSS, colisión o duplicado de selectores ya presentes en `globals.css`. | Portar solo los bloques ausentes (paso 1); ante choque, conservar el de `globals.css` y revisar en el repaso de fidelidad. |
| Mover Biblioteca deja enlaces a `/` apuntando a la landing en vez del grid. | Repunte explícito en el paso 6 de los tres enlaces detectados; el criterio de aceptación lo verifica. |
| El reveal-on-scroll deja secciones invisibles si el observer no dispara (p. ej. contenido ya en viewport al cargar). | `threshold` bajo (0.12) como el template; las secciones above-the-fold del hero usan `fade-in`, no `reveal`. |

---

## Lo que **no** entra en este spec

- Conectar el Home con datos reales (ticker/top/stats desde `seededScores` o `av_scores`).
- Envío real del formulario de contacto (backend, email).
- Lógica real de juegos, autenticación real, OAuth.
- Tests automatizados.
- Optimización de navegación instantánea (`unstable_instant`).

Cada uno de ellos, si llega, va en su propio spec.
