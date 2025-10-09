import React, { useEffect, useRef, useState } from "react";
import "./breathing.css";

export default function BreathingCoach() {
  const [mode, setMode] = useState("box"); // box | 478
  const [phase, setPhase] = useState("Inhale");
  const [count, setCount] = useState(0);
  const timer = useRef(0);

  const cycles = mode === "box" ? [ ["Inhale",4], ["Hold",4], ["Exhale",4], ["Hold",4] ]
                                : [ ["Inhale",4], ["Hold",7], ["Exhale",8] ];

  useEffect(() => {
    let i = 0, t = 0;
    const tick = () => {
      const [p, s] = cycles[i];
      setPhase(p); setCount((c) => (c >= s ? s : c + 1));
      t++;
      if (t >= s) { t = 0; i = (i + 1) % cycles.length; setCount(0); }
      timer.current = setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(timer.current);
  }, [mode]);

  return (
    <div className="bc-wrap">
      <h2>Breathing Coach</h2>
      <div className="bc-mode">
        <button onClick={() => setMode("box")} className={mode==="box"?"active":""}>Box 4-4-4-4</button>
        <button onClick={() => setMode("478")} className={mode==="478"?"active":""}>4-7-8</button>
      </div>
      <div className={`bc-circle ${phase.toLowerCase()}`}>
        <div className="bc-phase">{phase}</div>
        <div className="bc-count">{count}s</div>
      </div>
      <p className="bc-note">Optional: measure camera HR/HRV before/after to see changes.</p>
    </div>
  );
}
