export function getLetterPassphraseStorageKey(letterId: string): string {
  return `letters-unsent:passphrase:${letterId}`
}
