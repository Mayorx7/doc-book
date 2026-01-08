import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-2 group">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none text-slate-600 dark:text-slate-400 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={id}
            className={cn(
              "flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
