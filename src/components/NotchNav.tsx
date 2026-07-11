"use client";

import { useRef, useState } from "react";
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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/coach", label: "Growth Coach", icon: Sparkles },
  { href: "/ideas", label: "Idea Lab", icon: Lightbulb },
  { href: "/scripts", label: "Script Studio", icon: FileText },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
];

function NavIcon({
  item,
  mouseX,
  isActive,
  onClick,
}: {
  item: (typeof navItems)[number];
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

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
      style={{ width, height: width }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-center rounded-full"
      title={item.label}
    >
      <div
        className="flex items-center justify-center rounded-full w-full h-full"
        style={{
          backgroundColor: isActive
            ? "var(--color-accent)"
            : "var(--color-surface-hover)",
        }}
      >
        <Icon size={18} color={isActive ? "#0e1116" : "var(--color-text)"} />
      </div>
    </motion.button>
  );
}

export default function NotchNav() {
  const [expanded, setExpanded] = useState(false);
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  if (pathname === "/login" || pathname === "/signup") return null;

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
        className="flex items-center gap-2 h-12 rounded-full overflow-hidden"
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
                  onClick={() => router.push(item.href)}
                />
              ))}
              <div
                className="w-px h-6 mx-1"
                style={{ backgroundColor: "var(--color-border)" }}
              />
              <button
                onClick={handleLogout}
                title="Log out"
                className="flex items-center justify-center rounded-full w-9 h-9"
                style={{ backgroundColor: "var(--color-surface-hover)" }}
              >
                <LogOut size={16} color="var(--color-text-muted)" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
