import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF7F3] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

  const variants = {
    primary: 'bg-[#C96243] text-white font-semibold hover:bg-[#AE4F35] shadow-sm hover:shadow-[0_8px_20px_rgba(201,98,67,0.24)] focus:ring-[#C96243] border border-transparent',
    secondary: 'bg-white text-[#241D1A] border border-[#E8DDD6] hover:bg-[#FFF9F6] hover:text-[#C96243] hover:border-[#C96243]/50 focus:ring-[#C96243] shadow-sm',
    outline: 'bg-transparent text-[#241D1A] border border-[#E8DDD6] hover:border-[#C96243] hover:text-[#C96243] hover:bg-[#FFF9F6] focus:ring-[#C96243]',
    ghost: 'bg-transparent text-[#716963] hover:text-[#C96243] hover:bg-[#F4D8CC]/20 focus:ring-[#C96243]/20',
    danger: 'bg-[#FBE6E6] text-[#D95C5C] border border-[#D95C5C]/30 hover:bg-[#D95C5C] hover:text-white focus:ring-[#D95C5C]',
    electric: 'bg-[#4FA77B] text-white hover:bg-[#3E8B65] hover:shadow-[0_8px_20px_rgba(79,167,123,0.24)] focus:ring-[#4FA77B] border border-transparent',
    // Compatibility aliases
    gold: 'bg-[#C96243] text-white font-semibold hover:bg-[#AE4F35] focus:ring-[#C96243]',
    cream: 'bg-[#FFF9F6] text-[#716963] hover:text-[#241D1A] border border-[#E8DDD6] hover:bg-white focus:ring-[#C96243]',
    softblue: 'bg-[#E9F0FA] text-[#668BC4] hover:text-[#5578AF] border border-[#668BC4]/30 hover:bg-[#DDE7F4] focus:ring-[#668BC4]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 shadow-sm'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
