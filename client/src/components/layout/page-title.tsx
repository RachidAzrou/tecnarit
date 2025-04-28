import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  children?: ReactNode;
}

export function PageTitle({ title, children }: PageTitleProps) {
  return (
    <div className="mb-6 relative w-full">
      <div className="pt-5 pb-6 px-4 sm:px-6 bg-gradient-to-r from-[#233142] to-[#4da58e] relative overflow-hidden w-full rounded-md shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 text-white uppercase tracking-wider">
          {title}
        </h1>
        {children && (
          <div className="text-center text-sm text-white/90 max-w-2xl mx-auto mt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}