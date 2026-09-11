"use client";

import { ICategory } from "@/lib/database/models/category.model";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { Input } from "../ui/input";
import {
  createCategory,
  getAllCategories,
} from "@/lib/actions/category.actions";
import { cn } from "cn";

type DropdownProps = {
  value?: string;
  onChangeHandler?: (value: string) => void;
};

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category._id.toString() === value),
    [categories, value]
  );

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();

      if (categoryList) setCategories(categoryList as ICategory[]);
    };

    getCategories();
  }, []);

  // Close on outside click / Escape instead of relying on a focus trap so the
  // inline "add" input stays usable.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSelect = (categoryId: string) => {
    onChangeHandler?.(categoryId);
    setOpen(false);
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();

    if (!name || isAdding) return;

    // Already exists? Select it instead of creating a duplicate.
    const existing = categories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      handleSelect(existing._id.toString());
      setNewCategory("");
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      const category = await createCategory({ categoryName: name });

      if (!category) {
        setError("Could not create category. Try again.");
        return;
      }

      const created = category as ICategory;
      setCategories((prevState) => [...prevState, created]);
      onChangeHandler?.(created._id.toString());
      setNewCategory("");
      setOpen(false);
    } catch {
      setError("Could not create category. Try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="select-field flex items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn(!selectedCategory && "text-grey-500")}>
          {selectedCategory ? selectedCategory.name : "Category"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-grey-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-2xl bg-white p-2 shadow-md ring-1 ring-black/5">
          {categories.length > 0 ? (
            <ul role="listbox" className="flex flex-col">
              {categories.map((category) => (
                <li key={category._id.toString()}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={category._id.toString() === value}
                    onClick={() => handleSelect(category._id.toString())}
                    className={cn(
                      "select-item p-regular-14 w-full rounded-xl px-3 text-left hover:bg-primary-50",
                      category._id.toString() === value && "bg-primary-50"
                    )}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-regular-14 px-3 py-2 text-grey-500">
              No categories yet.
            </p>
          )}

          <div className="mt-1 border-t border-grey-50 pt-2">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={newCategory}
                placeholder="Add new category"
                className="input-field p-regular-14 h-11"
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || isAdding}
                className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-primary-500 px-4 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </button>
            </div>

            {error && (
              <p className="p-regular-14 mt-1 px-1 text-red-500">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
