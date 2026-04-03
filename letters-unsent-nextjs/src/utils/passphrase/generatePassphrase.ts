import { PASS_PHRASE_WORD_LIST } from "@/utils/passphrase/wordList"

function getSecureCrypto() {
  if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") {
    throw new Error("Secure random generator is unavailable in this environment.")
  }

  return globalThis.crypto
}

function secureRandomIndex(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error("Maximum bound must be a positive integer.")
  }

  const secureCrypto = getSecureCrypto()
  const randomValue = new Uint32Array(1)
  const maxUint32 = 2 ** 32
  const unbiasedLimit = Math.floor(maxUint32 / max) * max

  do {
    secureCrypto.getRandomValues(randomValue)
  } while (randomValue[0] >= unbiasedLimit)

  return randomValue[0] % max
}

export function generatePassphrase(wordCount = 4): string {
  if (!Number.isInteger(wordCount) || wordCount <= 0) {
    throw new Error("Word count must be a positive integer.")
  }

  const words = Array.from({ length: wordCount }, () => {
    const index = secureRandomIndex(PASS_PHRASE_WORD_LIST.length)
    return PASS_PHRASE_WORD_LIST[index]
  })

  return words.join("-")
}
