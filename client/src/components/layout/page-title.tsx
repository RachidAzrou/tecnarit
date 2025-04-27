import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  children?: ReactNode;
}

export function PageTitle({ title, children }: PageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center tecnarit-blue-text mb-2">
        {title}
      </h1>
      {children && (
        <div className="text-center text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}