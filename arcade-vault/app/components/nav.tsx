"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/components/user-provider";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useUser();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/biblioteca") return pathname === "/biblioteca" || pathname.startsWith("/juego");
    return pathname === href;
  };

  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={isActive("/") ? "active" : ""} onClick={close}>
            Inicio
          </Link>
          <Link href="/biblioteca" className={isActive("/biblioteca") ? "active" : ""} onClick={close}>
            Biblioteca
          </Link>
          <Link href="/salon" className={isActive("/salon") ? "active" : ""} onClick={close}>
            Salón de la Fama
          </Link>
          <Link href="/about" className={isActive("/about") ? "active" : ""} onClick={close}>
            Acerca de
          </Link>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <button className="btn auth-btn" onClick={() => router.push("/auth")}>
            Iniciar Sesión
          </button>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      />
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={isActive("/") ? "active" : ""} onClick={close}>
          Inicio
        </Link>
        <Link href="/biblioteca" className={isActive("/biblioteca") ? "active" : ""} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon" className={isActive("/salon") ? "active" : ""} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/about" className={isActive("/about") ? "active" : ""} onClick={close}>
          Acerca de
        </Link>
        <Link href="/auth" className={isActive("/auth") ? "active" : ""} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }} />
        <div
          className="pixel"
          style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--line)",
        padding: "20px 32px",
        textAlign: "center",
        color: "var(--ink-faint)",
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.16em",
      }}
    >
      © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
    </footer>
  );
}
