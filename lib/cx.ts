type ClassValue = string | false | null | undefined | Record<string, unknown>;

// Joins CSS class names, skipping falsy values. Objects contribute the keys
// whose value is truthy: cx("a", cond && "b", { c: cond }). Minimal
// replacement for the "classnames" package, dropped in favor of this helper.
export function cx(...args: ClassValue[]): string {
  return args
    .flatMap((arg) =>
      arg && typeof arg === "object"
        ? Object.keys(arg).filter((key) => arg[key])
        : arg || [],
    )
    .join(" ");
}
