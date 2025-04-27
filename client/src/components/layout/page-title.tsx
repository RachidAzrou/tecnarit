import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  children?: ReactNode;
}

export function PageTitle({ title, children }: PageTitleProps) {
  return (
    <div className="mb-10 relative">
      <div className="py-8 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-lg shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-blue-600 to-blue-500/20 rounded-t-lg"></div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-3 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
          {title}
        </h1>
        {children && (
          <div className="text-center text-lg text-gray-600 max-w-2xl mx-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}