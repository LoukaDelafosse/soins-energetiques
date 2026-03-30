interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-mauve-100 p-6
        ${hover ? "hover:shadow-md hover:border-mauve-200 transition-all duration-200" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
