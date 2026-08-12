"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  message: string;
};

export default function PopUp({ children, message }: Props) {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [horizontalShift, setHorizontalShift] = useState(0);
  const [arrowShift, setArrowShift] = useState(0);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!visible || !popupRef.current) return;

    const rect = popupRef.current.getBoundingClientRect();
    const contentArea = document.querySelector('[data-content-area="true"]');
    const containerRect = contentArea
      ? contentArea.getBoundingClientRect()
      : { left: 0, right: window.innerWidth };

    let shift = 0;

    if (isMobile) {
      // Mobile: just clamp to viewport edges with 16px padding
      if (rect.left < 16) {
        shift = 16 - rect.left;
      } else if (rect.right > window.innerWidth - 16) {
        shift = window.innerWidth - 16 - rect.right;
      }
    } else {
      // Desktop: clamp to content area with padding
      const contentPadding = 28;
      const extraBreathing = 8;
      const leftBound = containerRect.left + contentPadding + extraBreathing;
      const rightBound = containerRect.right - contentPadding - extraBreathing;

      if (rect.left < leftBound) {
        shift = leftBound - rect.left;
      } else if (rect.right > rightBound) {
        shift = rightBound - rect.right;
      }
    }

    setHorizontalShift(shift);
    setArrowShift(-shift);
  }, [visible, isMobile]);

  useEffect(() => {
    if (!visible) {
      setHorizontalShift(0);
      setArrowShift(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !isMobile) return;
    const handleOutsideTouch = (e: TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener('touchstart', handleOutsideTouch);
    return () => document.removeEventListener('touchstart', handleOutsideTouch);
  }, [visible, isMobile]);

  return (
    <span
      ref={triggerRef}
      className="relative inline"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={(e) => {
        e.stopPropagation();
        setVisible(prev => !prev);
      }}
    >
      <span className="border-b border-dashed border-current pb-0.5 cursor-help">
        {children}
      </span>
      {visible && (
        <span
          ref={popupRef}
          className="absolute z-50 px-3 py-2 rounded-lg leading-snug pointer-events-none"
          style={{
            bottom: '100%',
            marginBottom: '0.7rem',
            background: 'var(--bg-sidebar)',
            color: 'var(--text-main)',
            border: '1px solid var(--popup-border)',
            boxShadow: 'var(--popup-shadow)',
            whiteSpace: 'normal',
            left: '50%',
            width: isMobile ? 'calc(100vw - 2rem)' : 'max-content',
            maxWidth: isMobile ? 'calc(100vw - 2rem)' : 'min(800px, calc(100vw - 2rem))',
            transform: `translateX(calc(-50% + ${horizontalShift}px))`,
          }}
        >
          {message}
          <span
            className="absolute w-3.5 h-3.5 rotate-45 border-b border-r rounded-sm"
            style={{
              top: '100%',
              left: `calc(50% + ${arrowShift}px)`,
              transform: 'translateX(-50%) translateY(-25%)',
              background: 'var(--bg-sidebar)',
              borderColor: 'var(--popup-border)',
              filter: 'drop-shadow(var(--arrow-shadow))',
            }}
          />
        </span>
      )}
    </span>
  );
}