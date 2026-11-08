"use client";

import { CATEGORY_COLORS } from "@/lib/types";

const swatchClass =
  "block h-5 w-5 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-card peer-checked:ring-ink peer-focus-visible:ring-ink";

export function ColorSwatches({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Category color">
      {CATEGORY_COLORS.map((color) => (
        <label key={color.value} title={color.label} className="cursor-pointer">
          <input
            className="peer sr-only"
            type="radio"
            name={name}
            value={color.value}
            aria-label={color.label}
            checked={value === color.value}
            onChange={() => onChange(color.value)}
          />
          <span className={swatchClass} style={{ backgroundColor: color.value }} />
        </label>
      ))}
    </div>
  );
}

export function ColorDots({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Category color">
      {CATEGORY_COLORS.map((color) => (
        <label key={color.value} title={color.label} className="cursor-pointer">
          <input
            className="peer sr-only"
            type="radio"
            name={name}
            value={color.value}
            aria-label={color.label}
            defaultChecked={color.value === defaultValue}
            required
          />
          <span className={swatchClass} style={{ backgroundColor: color.value }} />
        </label>
      ))}
    </div>
  );
}
