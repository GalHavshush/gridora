export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="gridora-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb86b" />
          <stop offset="1" stopColor="#ff5f8f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#15122b" />
      <rect x="6" y="6" width="11" height="9" rx="2.5" fill="url(#gridora-mark)" />
      <rect x="19" y="6" width="7" height="9" rx="2.5" fill="#fff" opacity=".9" />
      <rect x="6" y="17" width="7" height="9" rx="2.5" fill="#fff" opacity=".9" />
      <rect x="15" y="17" width="11" height="9" rx="2.5" fill="#fff" opacity=".45" />
    </svg>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 text-page">
      <LogoMark className="size-9 shadow-lg shadow-black/20 rounded-[10px]" />
      <span className="font-display text-[22px] font-semibold tracking-tight">Gridora</span>
    </div>
  )
}
