const Badge = ({ children, variant = "danger", size = "sm" }) => {
  const variants = {
    danger: "bg-rose-500 text-white",
    primary: "bg-indigo-600 text-white",
    success: "bg-emerald-500 text-white",
    warning: "bg-amber-500 text-white",
    neutral: "bg-slate-100 text-slate-700",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span className={`inline-flex items-center justify-center font-semibold rounded-full ${variants[variant] || variants.danger} ${sizes[size] || sizes.sm}`}>
      {children}
    </span>
  );
};

export default Badge;