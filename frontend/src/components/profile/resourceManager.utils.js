export const defaultForField = (field) => {
  if (field.type === 'checkbox') return false;
  if (field.type === 'select') return field.options?.[0] ?? '';
  return '';
};

export const emptyFor = (fields) => Object.fromEntries(
  fields.map((field) => [field.name, defaultForField(field)]),
);