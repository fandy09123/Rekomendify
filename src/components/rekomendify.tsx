import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  Compass,
  Settings as SettingsIcon,
  MapPin,
  QrCode,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState, memo } from "react";
import mascots from "@/assets/mascots.png";

function useRegionContext(): string | null {
  const loc = useLocation();
  return useMemo(() => {
    const m = loc.pathname.match(/^\/r\/([^\/]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }, [loc.pathname]);
}

export const BottomNav = memo(function BottomNav() {
  const region = useRegionContext();
  const loc = useLocation();

  const berandaTo = region ? `/r/${region}` : "/";
  const jelajahTo = region ? `/r/${region}/jelajah` : "/explore";
  const scanTo = region ? `/r/${region}/scan` : "/scan";
  const pesanTo = region ? `/r/${region}/messages` : "/messages";
  const pengaturanTo = region ? `/r/${region}/settings` : "/settings";

  const isActive = (target: string) => {
    if (target === "/") return loc.pathname === "/";
    return loc.pathname === target;
  };

  const item = (to: string, label: string, Icon: any, active: boolean) => (
    <li className="flex-1">
      <Link
        to={to}
        preload="intent"
        className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
          active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="size-5" />
        {label}
      </Link>
    </li>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="relative mx-auto flex max-w-md items-end justify-around">
        {item(berandaTo, "Beranda", Home, isActive(berandaTo))}
        {item(jelajahTo, "Jelajah", Compass, isActive(jelajahTo))}

        {/* Centered Scan QR — elevated pill */}
        <li className="flex-1">
          <Link
            to={scanTo}
            preload="intent"
            className="mx-auto -mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift ring-4 ring-background transition hover:scale-105 active:scale-95"
            aria-label="Scan QR"
          >
            <QrCode className="size-6" />
          </Link>
          <p
            className={`mt-1 text-center text-[11px] font-medium ${loc.pathname.endsWith("/scan") ? "text-primary font-semibold" : "text-muted-foreground"}`}
          >
            Scan QR
          </p>
        </li>

        {item(pesanTo, "Pesan", MessageSquare, isActive(pesanTo))}
        {item(pengaturanTo, "Pengaturan", SettingsIcon, isActive(pengaturanTo))}
      </ul>
    </nav>
  );
});

export function PageShell({ children, noNav }: { children: React.ReactNode; noNav?: boolean }) {
  return (
    <div className="min-h-screen pb-28">
      {children}
      {!noNav && <BottomNav />}
    </div>
  );
}

export const MascotWelcome = memo(function MascotWelcome({
  name,
  message,
}: {
  name: string;
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex min-h-[7.5rem] items-center gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur"
    >
      <motion.img
        src={mascots}
        alt="Cak Mulyo & Jeng Sari"
        width={80}
        height={80}
        decoding="async"
        className="size-20 shrink-0"
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-primary">
          {name}
        </p>
        {/* Dibatasi 3 baris agar tinggi kartu stabil untuk semua wilayah. */}
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-foreground">{message}</p>
      </div>
    </motion.div>
  );
});

export function MascotIntro({ onDone }: { onDone?: () => void }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onDone?.();
    }, 1600);
    return () => clearTimeout(t);
  }, [onDone]);
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center batik-bg"
    >
      <motion.img
        initial={{ scale: 0.6, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 12 }}
        src={mascots}
        alt="Welcome"
        width={220}
        height={220}
        decoding="async"
        className="size-56"
      />
    </motion.div>
  );
}

export const LocationCard = memo(function LocationCard({
  regionSlug,
  locSlug,
  name,
  photo,
  category,
  hours,
  price,
  featured,
  distance,
}: {
  regionSlug: string;
  locSlug: string;
  name: string;
  photo?: string | null;
  category?: string | null;
  hours?: string | null;
  price?: string | null;
  featured?: boolean;
  distance?: string | null;
}) {
  const location = useLocation();

  return (
    <Link
      to="/r/$slug/$loc"
      params={{ slug: regionSlug, loc: locSlug }}
      search={{ from: location.href }}
      preload="intent"
      className="group flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left transition duration-200 hover:shadow-lift active:scale-[0.99]"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {photo ? (
          <img
            src={photo}
            alt={name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <MapPin className="size-6" />
          </div>
        )}
        {featured && (
          <span className="absolute left-1 top-1 rounded-full bg-mustard px-1.5 py-0.5 text-[10px] font-bold text-ink">
            ★
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {category && (
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-accent">
              {category}
            </p>
          )}
          {distance && (
            <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {distance}
            </span>
          )}
        </div>
        <h3 className="mt-0.5 truncate font-display text-base text-foreground">{name}</h3>
        {hours && <p className="mt-1 truncate text-xs text-muted-foreground">{hours}</p>}
        {price && <p className="truncate text-xs text-muted-foreground">{price}</p>}
      </div>
    </Link>
  );
});
