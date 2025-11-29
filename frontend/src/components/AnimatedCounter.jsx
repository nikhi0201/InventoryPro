import React, { useEffect, useState } from "react";

export default function AnimatedCounter({ value = 0, duration = 1200, className = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = performance.now();
    const from = 0;
    const to = Number(value) || 0;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setCount(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <div className={className}>{count.toLocaleString()}</div>;
}
