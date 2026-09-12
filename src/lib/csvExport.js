function normalizeColumns(columns) {
  return (columns || []).map(column => (
    typeof column === 'string' ? { key: column, label: column } : column
  ));
}

function escapeCsvValue(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function serializeCsv(rows, columns) {
  const normalizedColumns = normalizeColumns(columns);
  const lines = [
    normalizedColumns.map(column => escapeCsvValue(column.label || column.key)).join(','),
    ...(rows || []).map(row => normalizedColumns
      .map(column => escapeCsvValue(row?.[column.key]))
      .join(',')),
  ];
  return `${lines.join('\r\n')}\r\n`;
}

export function downloadCsv(rows, filename, columns, { documentRef = document, urlApi = URL } = {}) {
  const csv = serializeCsv(rows, columns);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = urlApi.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  urlApi.revokeObjectURL(url);
}
