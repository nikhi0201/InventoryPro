import React, { useEffect, useState } from "react";

export default function ActionBurst({ trigger }) {
  // trigger is any changing value to replay burst
  const [key, setKey] = useState(0);
  useEffect(() => { if (trigger != null) setKey(k => k + 1); }, [trigger]);
  return (
    <div key={key} aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="burst-wrap relative w-48 h-48">
        <div className="burst" />
      </div>
    </div>
  );
}
