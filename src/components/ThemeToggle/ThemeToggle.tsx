import { useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSunHigh } from "@tabler/icons-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <button
      type="button"
      className={className}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <IconSunHigh size={20} stroke={2.2} aria-hidden="true" />
      ) : (
        <IconMoonStars size={20} stroke={2.2} aria-hidden="true" />
      )}
    </button>
  );
}
