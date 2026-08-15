export function localDateTimeToIso(value: string) {
  return new Date(value).toISOString();
}

export function isoToLocalDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return '';
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
