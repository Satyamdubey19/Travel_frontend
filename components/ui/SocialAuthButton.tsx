import React from 'react';

interface SocialAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
}

export default function SocialAuthButton({ icon, label, ...props }: SocialAuthButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${props.className ?? ""}`}
    >
      <span className="flex h-5 w-5 items-center justify-center text-slate-700">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
