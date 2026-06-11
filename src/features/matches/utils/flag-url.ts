export function getFlagUrl(flagCode: string | null) {
  if (!flagCode) {
    return null;
  }

  return `https://flagcdn.com/48x36/${flagCode}.png`;
}
