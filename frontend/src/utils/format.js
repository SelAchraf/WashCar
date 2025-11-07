export function formatDA(amount) {
  try {
    // Use grouping separators in fr-DZ style, and display DA suffix
    return `${Number(amount).toLocaleString('fr-DZ')} DA`;
  } catch (e) {
    return `${amount} DA`;
  }
}


