"use client";

import { useState, useRef } from "react";

type Props = {
  children: React.ReactNode;
  message: string;
};

export default function PopUp({ children, message }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="border-b border-dashed border-current cursor-help">
        {children}
      </span>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-xs px-3 py-2 rounded-lg leading-snug pointer-events-none"
          style={{
            background: 'var(--bg-sidebar)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {message}
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: 'var(--border)' }}
          />
        </span>
      )}
    </span>
  );
}