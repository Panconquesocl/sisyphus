import { HABIT_ICONS, type HabitIconName } from "@/lib/habit-icons";
import { rampFor } from "@/lib/grid";

export function HabitIcon({
  icon,
  color,
  className,
}: {
  icon: string | null;
  color: string;
  className?: string;
}) {
  if (!icon || !(icon in HABIT_ICONS)) return null;
  const Icon = HABIT_ICONS[icon as HabitIconName];
  return <Icon className={className} style={{ color: rampFor(color)[4], fill: rampFor(color)[4] }} />;
}
