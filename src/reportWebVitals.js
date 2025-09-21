// Works with both old (get*) and new (on*) web-vitals APIs
const reportWebVitals = (onPerfEntry) => {
  if (!onPerfEntry || !(onPerfEntry instanceof Function)) return;

  import('web-vitals')
    .then((mod) => {
      const onCLS  = mod.onCLS  || mod.getCLS;
      const onFID  = mod.onFID  || mod.getFID;
      const onFCP  = mod.onFCP  || mod.getFCP;
      const onLCP  = mod.onLCP  || mod.getLCP;
      const onTTFB = mod.onTTFB || mod.getTTFB;
      const onINP  = mod.onINP; // new metric (optional)

      onCLS && onCLS(onPerfEntry);
      if (onINP) onINP(onPerfEntry); else if (onFID) onFID(onPerfEntry);
      onFCP  && onFCP(onPerfEntry);
      onLCP  && onLCP(onPerfEntry);
      onTTFB && onTTFB(onPerfEntry);
    })
    .catch(() => {});
};

export default reportWebVitals;
