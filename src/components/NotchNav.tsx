"use client";

import { useRef, useState, useTransition } from "react";
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
            top: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 10px",
            borderRadius: 6,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            fontSize: 12,
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

  const widthSync = useTransform(distance, [-150, 0, 150], [36, 56, 36]);
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
      className="flex items-center justify-center rounded-full"
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
          <Spinner size={16} variant="dark" />
        ) : (
          <Icon size={18} color={isActive ? "#0e1116" : "var(--color-text)"} />
        )}
      </div>
    </motion.button>
  );
}

export default function NotchNav() {
  const [expanded, setExpanded] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
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
    <div className="fixed top-4 left-0 right-0 flex justify-center z-50">
      <motion.div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false);
          mouseX.set(Infinity);
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        animate={{
          width: expanded ? "auto" : 48,
          paddingLeft: expanded ? 12 : 0,
          paddingRight: expanded ? 12 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center gap-2 h-12 rounded-full overflow-visible"
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
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#0e1116" }}
              />
            </motion.div>
          ) : (
            <motion.div key="items" className="flex items-center gap-2">
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
                className="w-px h-6 mx-1"
                style={{ backgroundColor: "var(--color-border)" }}
              />
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setLogoutHovered(true)}
                onMouseLeave={() => setLogoutHovered(false)}
              >
                <Tooltip label="Log out" show={logoutHovered} />
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center rounded-full w-9 h-9"
                  style={{ backgroundColor: "var(--color-surface-hover)" }}
                >
                  {isPending && pendingKey === "logout" ? (
                    <Spinner size={14} />
                  ) : (
                    <LogOut size={16} color="var(--color-text-muted)" />
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
