import { cn } from "@/core/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Adjust the maximum width of the container. 
   * @default "7xl"
   */
  size?: "5xl" | "6xl" | "7xl" | "full";
}

/**
 * A reusable layout component that centralizes page width constraints.
 */
export function Container({ 
  children, 
  className, 
  size = "7xl", 
  ...props 
}: ContainerProps) {
  const maxWidthClass = {
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    "full": "max-w-full",
  }[size];

  return (
    <div 
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8", 
        maxWidthClass,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

