"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShootingType } from "@prisma/client";

type Option = { value: ShootingType; label: string };

type Props = {
  name: string;
  required?: boolean;
  options: Option[];
  id?: string;
  placeholder?: string;
  defaultValue?: ShootingType;
};

export function FormShootingTypeSelect({
  name,
  required,
  options,
  id,
  placeholder = "Bitte wählen",
  defaultValue,
}: Props) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={value}
        required={required && value === ""}
      />
      <Select
        value={value || undefined}
        onValueChange={setValue}
        required={required}
      >
        <SelectTrigger id={id} aria-label={placeholder}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
