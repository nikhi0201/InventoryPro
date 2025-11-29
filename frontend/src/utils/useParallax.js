import { useEffect } from 'react';

export default function useParallax(ref, factor = 0.02) {
  useEffect(() => {
    if (!ref?.current) return;
    const el = ref.current;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) - rect.width / 2;
      const y = (e.clientY - rect.top) - rect.height / 2;
      el.style.transform = `translate3d(${x * factor}px, ${y * factor}px, 0)`;
    }
    function onLeave() { el.style.transform = ''; }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    }
  }, [ref, factor]);
}
