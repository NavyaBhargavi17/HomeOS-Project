import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  highlight = 'none', // 'none' | 'cyan' | 'blue' | 'coral' | 'gold' | 'navy'
  padding = 'normal', // 'none' | 'sm' | 'normal' | 'lg'
  onClick,
  ...props
}) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    normal: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const highlights = {
    none: '',
    cyan: 'border-l-4 border-l-[#C96243]',
    blue: 'border-l-4 border-l-[#668BC4]',
    coral: 'border-l-4 border-l-[#D95C5C]',
    success: 'border-l-4 border-l-[#4FA77B]',
    warning: 'border-l-4 border-l-[#E7A84B]',
    // Compatibility aliases
    gold: 'border-l-4 border-l-[#C96243]',
    navy: 'border-l-4 border-l-[#668BC4]',
    cream: 'border-l-4 border-l-[#F4D8CC]',
    softblue: 'border-l-4 border-l-[#668BC4]'
  };

  const hoverStyle = hoverEffect
    ? 'hover:-translate-y-0.5 hover:shadow-homeos-lg hover:border-[#DEC9BE] transition-all duration-200 cursor-pointer'
    : 'transition-all duration-200';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E8DDD6] shadow-homeos text-[#241D1A] ${paddings[padding]} ${highlights[highlight]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
