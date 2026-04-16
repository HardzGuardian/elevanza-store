import { cn } from "@/core/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /**
   * Vertical padding scale.
   * @default "md"
   */
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  /**
   * Use semantic tags or a generic div.
   * @default "section"
   */
  as?: "section" | "div" | "header" | "footer";
}

/**
 * A semantic layout section with consistent vertical spacing options.
 */
export function Section({
  children,
  className,
  spacing = "md",
  as: Component = "section",
  ...props
}: SectionProps) {
  const spacingClass = {
    none: "",
    sm: "py-8",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
    xl: "py-32 md:py-48",
  }[spacing];

  return (
    <Component 
      className={cn(spacingClass, className)} 
      {...props}
    >
      {children}
    </Component>
  );
}

