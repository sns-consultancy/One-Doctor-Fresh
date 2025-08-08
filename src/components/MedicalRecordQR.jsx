import React from 'react';

// Placeholder QR component. For full functionality, install `qrcode.react`.
export default function MedicalRecordQR({ data }) {
  if (!data) return null;
  return (
    <pre className="qr-container border p-2">{data}</pre>
  );
}
