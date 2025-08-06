import React, { useState } from 'react';
import MedicalRecordQR from '../components/MedicalRecordQR';
import {
  AGE_GROUPS,
  addRecord,
  getRecords,
  getGroupJSON,
  exportGroupToPDF,
} from '../services/medicalRecordService';

export default function MedicationHistory() {
  const [form, setForm] = useState({ name: '', dosage: '', date: '', age: '' });
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS.adults);
  const [records, setRecords] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.date || !form.age) return;
    const age = parseInt(form.age, 10);
    let group = AGE_GROUPS.adults;
    if (age <= 1) group = AGE_GROUPS.infants;
    else if (age <= 4) group = AGE_GROUPS.toddlers;
    else if (age <= 17) group = AGE_GROUPS.youth;
    addRecord(group, { name: form.name, dosage: form.dosage, date: form.date });
    setAgeGroup(group);
    setRecords(getRecords(group));
    setForm({ name: '', dosage: '', date: '', age: '' });
  };

  const handleLoad = (group) => {
    setAgeGroup(group);
    setRecords(getRecords(group));
  };

  const handlePDF = () => {
    exportGroupToPDF(ageGroup);
  };

  const jsonData = getGroupJSON(ageGroup);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Medication History</h2>
      <form onSubmit={handleAdd} className="space-y-2">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Medication Name" className="border p-1" />
        <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="Dosage" className="border p-1" />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-1" />
        <input name="age" value={form.age} onChange={handleChange} placeholder="Age" className="border p-1" />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1">Add</button>
      </form>

      <div className="mt-4">
        <h3 className="font-semibold">Select Age Group</h3>
        {Object.values(AGE_GROUPS).map((g) => (
          <button key={g} className="mr-2 underline" onClick={() => handleLoad(g)}>{g}</button>
        ))}
      </div>

      <div className="mt-4">
        <button className="bg-green-500 text-white px-2 py-1" onClick={handlePDF}>Export PDF</button>
      </div>

      <ul className="mt-4 list-disc list-inside">
        {records.map((r, idx) => (
          <li key={idx}>{r.name} - {r.dosage} - {r.date}</li>
        ))}
      </ul>

      <div className="mt-4">
        <MedicalRecordQR data={jsonData} />
      </div>
    </div>
  );
}
