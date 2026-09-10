interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({ title, subtitle, centered = false }: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${centered ? 'text-center' : ''}`}>
      <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 leading-tight">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-base text-primary-600 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
