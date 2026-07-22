"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Lightbulb,
  FileText,
  Kanban,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import Spinner from "./Spinner";
import Button from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/coach", label: "Growth Coach", icon: Sparkles },
  { href: "/ideas", label: "Idea Lab", icon: Lightbulb },
  { href: "/scripts", label: "Script Studio", icon: FileText },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
];

function Tooltip({ label, show }: { label: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
          style={{
            position: "absolute",
            top: "calc(100% + 14px)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "7px 14px",
            borderRadius: 8,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            fontSize: 13,
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavIcon({
  item,
  mouseX,
  isActive,
  onClick,
  isPending,
}: {
  item: (typeof navItems)[number];
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isActive: boolean;
  onClick: () => void;
  isPending: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return 0;
    return val - (bounds.x + bounds.width / 2);
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [50, 78, 50]);
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 200,
    damping: 15,
  });

  const Icon = item.icon;

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width, position: "relative" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.15 }}
      // glow-interactive's lift (translateY on :hover) is superseded by
      // Framer Motion's own inline transform (it owns `transform` here via
      // the `scale` animation above — inline style always wins over a CSS
      // pseudo-class) so only the box-shadow/outline glow actually shows.
      // That's the correct outcome: this button already has its own
      // width-spring motion, it doesn't need a second lift animation.
      className="flex items-center justify-center rounded-full glow-interactive"
    >
      <Tooltip label={item.label} show={hovered} />
      <div
        className="flex items-center justify-center rounded-full w-full h-full"
        style={{
          backgroundColor: isActive
            ? "var(--color-accent)"
            : "var(--color-surface-hover)",
        }}
      >
        {isActive && isPending ? (
          <Spinner size={22} variant="dark" />
        ) : (
          <Icon size={24} color={isActive ? "#0e1116" : "var(--color-text)"} />
        )}
      </div>
    </motion.button>
  );
}

export default function NotchNav() {
  const [expanded, setExpanded] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleNavigate(href: string) {
    setPendingKey(href);
    startTransition(() => {
      router.push(href);
    });
  }

  function handleLogout() {
    setPendingKey("logout");
    startTransition(async () => {
      await signOut();
      router.push("/login");
    });
  }

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/"
  )
    return null;

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center z-50">
      <motion.div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false);
          mouseX.set(Infinity);
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        animate={{
          width: expanded ? "auto" : 68,
          paddingLeft: expanded ? 18 : 0,
          paddingRight: expanded ? 18 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center gap-3 h-17 rounded-full overflow-visible"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="dot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#0e1116" }}
              />
            </motion.div>
          ) : (
            <motion.div key="items" className="flex items-center gap-3">
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
              >
                <Tooltip label="Home" show={logoHovered} />
                <Button
                  variant="ghost"
                  iconOnly
                  onClick={() => handleNavigate("/dashboard")}
                  aria-label="CreatorOS home"
                  style={{
                    width: 50,
                    height: 50,
                    padding: 0,
                    border: "none",
                    backgroundColor: "transparent",
                    // Kept as the logo's own native rounded-square shape
                    // (radius.md, the same token used elsewhere in the
                    // design system) rather than iconOnly's usual full
                    // circle — the asset itself is a self-contained
                    // rounded-square mark, not a transparent glyph, so
                    // masking it into a circle would crop it against its
                    // own baked-in corners instead of matching them.
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="CreatorOS"
                    width={50}
                    height={50}
                    priority
                    style={{ borderRadius: 12 }}
                  />
                </Button>
              </div>
              <div
                className="w-px h-9 mx-1.5"
                style={{ backgroundColor: "var(--color-border)" }}
              />
              {navItems.map((item) => (
                <NavIcon
                  key={item.href}
                  item={item}
                  mouseX={mouseX}
                  isActive={pathname === item.href}
                  isPending={isPending && pendingKey === item.href}
                  onClick={() => handleNavigate(item.href)}
                />
              ))}
              <div
                className="w-px h-9 mx-1.5"
                style={{ backgroundColor: "var(--color-border)" }}
              />
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setLogoutHovered(true)}
                onMouseLeave={() => setLogoutHovered(false)}
              >
                <Tooltip label="Log out" show={logoutHovered} />
                <Button
                  variant="ghost"
                  iconOnly
                  onClick={handleLogout}
                  aria-label="Log out"
                  style={{
                    width: 50,
                    height: 50,
                    border: "none",
                    backgroundColor: "var(--color-surface-hover)",
                  }}
                >
                  {isPending && pendingKey === "logout" ? (
                    <Spinner size={18} />
                  ) : (
                    <LogOut size={22} color="var(--color-text-muted)" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
