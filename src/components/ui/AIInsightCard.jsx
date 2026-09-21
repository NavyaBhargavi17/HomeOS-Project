import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function AIInsightCard({
  title = 'HomeOS Intelligence',
  badge = 'AI Insight',
  description,
  recommendation,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF9F6] to-[#FBF7F3] border border-[#E8DDD6] p-5 sm:p-6 shadow-homeos ${className}`}
    >
      {/* Ambient soft glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F4D8CC]/40 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F4D8CC] border border-[#C96243]/25 text-[#C96243] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-5 h-5 fill-[#C96243]" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#241D1A] tracking-tight font-display flex items-center gap-1.5">
                <span>{title}</span>
                <span className="text-[#C96243]">✦</span>
              </h4>
              {badge && (
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#F4D8CC] text-[#C96243] border border-[#C96243]/30">
                  {badge}
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs text-[#716963] leading-relaxed max-w-2xl">
                {description}
              </p>
            )}

            {recommendation && (
              <div className="flex items-center gap-2 text-[11px] text-[#716963] pt-0.5">
                <span className="font-semibold text-[#241D1A]">Recommended:</span>
                <span>{recommendation}</span>
              </div>
            )}
          </div>
        </div>

        {actionText && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            icon={ArrowRight}
            iconPosition="right"
            className="shrink-0 self-start md:self-center shadow-sm"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
