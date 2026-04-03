export type ReadyLetterPayload = {
  content: string
  intended_recipient: string | null
  author_name: string | null
}

export type ReleaseSubmitInput = {
  ownerPassphrase: string | null
  savePassphraseOnDevice: boolean
  tokenCopied: boolean
}

export type ReleaseSubmitResult = {
  id: string
}
