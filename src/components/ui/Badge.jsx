import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'running' | 'idle' | 'warning' | 'urgent' | 'service' | 'cyan' | 'blue' | 'neutral'
  size = 'md',
  dot = false,
  className = ''
}) {
  const variants = {
    running: 'bg-[#E4F3EB] text-[#4FA77B] border-[#4FA77B]/30',
    idle: 'bg-[#FBF7F3] text-[#716963] border-[#E8DDD6]',
    warning: 'bg-[#FFF1D8] text-[#A86F1C] border-[#E7A84B]/35',
    urgent: 'bg-[#FBE6E6] text-[#D95C5C] border-[#D95C5C]/35',
    service: 'bg-[#FBE6E6] text-[#D95C5C] border-[#D95C5C]/35',
    cyan: 'bg-[#F4D8CC] text-[#C96243] border-[#C96243]/30',
    blue: 'bg-[#E9F0FA] text-[#668BC4] border-[#668BC4]/30',
    neutral: 'bg-[#FBF7F3] text-[#716963] border-[#E8DDD6]',
    success: 'bg-[#E4F3EB] text-[#4FA77B] border-[#4FA77B]/30',
    terracotta: 'bg-[#F4D8CC] text-[#C96243] border-[#C96243]/30',
    // Compatibility aliases
    gold: 'bg-[#F4D8CC] text-[#C96243] border-[#C96243]/30',
    navy: 'bg-[#E9F0FA] text-[#668BC4] border-[#668BC4]/30',
    softblue: 'bg-[#E9F0FA] text-[#668BC4] border-[#668BC4]/30'
  };

  const dots = {
    running: 'bg-[#4FA77B] animate-pulse',
    idle: 'bg-[#9A908A]',
    warning: 'bg-[#E7A84B]',
    urgent: 'bg-[#D95C5C] animate-ping',
    service: 'bg-[#D95C5C] animate-ping',
    cyan: 'bg-[#C96243]',
    blue: 'bg-[#668BC4]',
    neutral: 'bg-[#9A908A]',
    success: 'bg-[#4FA77B]',
    terracotta: 'bg-[#C96243]',
    gold: 'bg-[#C96243]',
    navy: 'bg-[#668BC4]',
    softblue: 'bg-[#668BC4]'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1 tracking-normal',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[variant] || dots.neutral}`}></span>}
      {children}
    </span>
  );
}
