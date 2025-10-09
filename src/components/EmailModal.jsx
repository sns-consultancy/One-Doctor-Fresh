import React, { useState } from "react";

export default function EmailModal({ open, onClose, onSend, defaultSubject = "Your Symptom Report" }) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-5 space-y-3">
        <h3 className="text-lg font-semibold">Send Report by Email</h3>
        <input
          type="email"
          placeholder="patient@email.com"
          className="w-full border rounded-lg p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          className="w-full border rounded-lg p-2"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button
            onClick={() => onSend({ email, subject })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
