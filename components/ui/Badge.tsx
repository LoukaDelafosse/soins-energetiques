interface BadgeProps {
  children: React.ReactNode;
  variant?: "mauve" | "rose" | "green" | "blue" | "gray";
}

const variants = {
  mauve: "bg-mauve-100 text-mauve-800",
  rose: "bg-rose-100 text-rose-700",
  green: "bg-gold-100 text-gold-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-mauve-100 text-mauve-700",
};

export default function Badge({ children, variant = "mauve" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}
