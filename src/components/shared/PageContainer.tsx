import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 ${className}`}>
      {children}
    </main>
  );
}
