
import {
  Dumbbell, Droplet, BookOpen, Footprints, HeartPulse, Moon, Code, Apple,
  Bike, Coffee, Music, Pencil, Sun, Leaf, Brain, Target, Square ,
  type LucideIcon,
} from "lucide-react";

export const HABIT_ICONS = {
  Dumbbell, Droplet, BookOpen, Footprints, HeartPulse, Moon, Code, Apple,
  Bike, Coffee, Music, Pencil, Sun, Leaf, Brain, Target, Square
} satisfies Record<string, LucideIcon>;

export type HabitIconName = keyof typeof HABIT_ICONS;
export const HABIT_ICON_NAMES = Object.keys(HABIT_ICONS) as HabitIconName[];
