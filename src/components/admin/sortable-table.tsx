"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

export type SortDirection = "asc" | "desc";
export type SortValue = string | number | boolean | null | undefined;
export type SortState<K extends string> = { key: K; direction: SortDirection };

// Tri « à la française » : insensible à la casse et aux accents, et 10 passe
// après 9 plutôt qu'entre 1 et 2.
const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });

function isEmpty(value: SortValue) {
  return value === null || value === undefined || value === "";
}

function compare(a: SortValue, b: SortValue) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Trie des lignes déjà chargées, sans aller-retour serveur.
 *
 * `accessors` doit être défini hors composant : une référence stable évite de
 * retrier à chaque rendu.
 */
export function useSortedRows<T, A extends Record<string, (row: T) => SortValue>>({
  rows,
  accessors,
  initialKey,
  initialDirection = "asc",
}: {
  rows: T[];
  accessors: A;
  initialKey: Extract<keyof A, string>;
  initialDirection?: SortDirection;
}) {
  type K = Extract<keyof A, string>;

  const [sort, setSort] = useState<SortState<K>>({
    key: initialKey,
    direction: initialDirection,
  });

  const sorted = useMemo(() => {
    const accessor = accessors[sort.key];
    if (!accessor) return rows;

    return [...rows].sort((rowA, rowB) => {
      const a = accessor(rowA);
      const b = accessor(rowB);

      // Une cellule vide n'a pas de place « naturelle » dans l'ordre : on la
      // renvoie toujours en bas, dans les deux sens de tri.
      if (isEmpty(a) || isEmpty(b)) {
        if (isEmpty(a) && isEmpty(b)) return 0;
        return isEmpty(a) ? 1 : -1;
      }

      const result = compare(a, b);
      return sort.direction === "asc" ? result : -result;
    });
  }, [rows, accessors, sort]);

  function toggleSort(key: K) {
    setSort((previous) =>
      previous.key === key
        ? { key, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  }

  return { sorted, sort, toggleSort };
}

export function SortableHeader<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onSort: (key: K) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  const Icon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-3 font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex items-center gap-1.5 rounded-lg text-left transition-colors hover:text-ink ${
          active ? "text-ink" : ""
        }`}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 transition-opacity ${
            active ? "opacity-100" : "opacity-35 group-hover:opacity-70"
          }`}
        />
      </button>
    </th>
  );
}

/** En-tête d'une colonne qu'on ne trie pas (vignette, cases, actions). */
export function PlainHeader({
  label = "",
  srLabel,
  className = "",
}: {
  label?: string;
  srLabel?: string;
  className?: string;
}) {
  return (
    <th scope="col" className={`px-4 py-3 font-semibold ${className}`}>
      {srLabel ? <span className="sr-only">{srLabel}</span> : label}
    </th>
  );
}
