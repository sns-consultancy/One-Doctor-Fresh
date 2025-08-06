export const AGE_GROUPS = {
  infants: 'infants',
  toddlers: 'toddlers',
  youth: 'youth',
  adults: 'adults',
};

const STORAGE_KEY = 'medical_records';

function load() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    [AGE_GROUPS.infants]: [],
    [AGE_GROUPS.toddlers]: [],
    [AGE_GROUPS.youth]: [],
    [AGE_GROUPS.adults]: [],
  };
}

function save(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(ageGroup, record) {
  const records = load();
  if (!records[ageGroup]) {
    records[ageGroup] = [];
  }
  records[ageGroup].push(record);
  save(records);
}

export function getRecords(ageGroup, startDate, endDate) {
  const records = load()[ageGroup] || [];
  return records.filter((r) => {
    const d = new Date(r.date);
    return (!startDate || d >= new Date(startDate)) && (!endDate || d <= new Date(endDate));
  });
}

export function getGroupJSON(ageGroup) {
  const records = load()[ageGroup] || [];
  return JSON.stringify(records);
}

export async function exportGroupToPDF(ageGroup) {
  try {
    const { jsPDF } = await import('jspdf');
    const records = load()[ageGroup] || [];
    const doc = new jsPDF();
    doc.text(`Medication History: ${ageGroup}`, 10, 10);
    records.forEach((r, idx) => {
      doc.text(`${idx + 1}. ${r.name} - ${r.dosage} - ${r.date}`, 10, 20 + idx * 10);
    });
    doc.save(`${ageGroup}-medications.pdf`);
  } catch (err) {
    console.error('PDF export failed. Ensure jspdf is installed.', err);
  }
}
