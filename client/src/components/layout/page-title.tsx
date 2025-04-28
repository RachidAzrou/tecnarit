import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  children?: ReactNode;
}

export function PageTitle({ title, children }: PageTitleProps) {
  return (
    <div className="mb-6 relative w-full">
      <div className="pt-4 pb-5 px-4 sm:px-6 bg-[#f8f9fa] relative overflow-hidden w-full">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#233142] to-[#4da58e]"></div>
        
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-1 text-[#233142]">
          {title}
        </h1>
        {children && (
          <div className="text-center text-sm text-gray-600 max-w-2xl mx-auto mt-1">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}