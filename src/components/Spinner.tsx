export function Spinner({ 
  size = "sm", 
  variant = "light" 
}: { 
  size?: "xs" | "sm" | "md";
  variant?: "light" | "dark";
}) {
  const sizeClasses = {
    xs: "h-3 w-3 border",
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
  };

  const colorClasses = {
    light: "border-white border-t-transparent",
    dark: "border-neutral-900 border-t-transparent",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[variant]} animate-spin rounded-full`}
      role="status"
      aria-label="Loading"
    />
  );
}
