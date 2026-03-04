const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" as const;

export function encodeBase62(num: number): string {
  if (!Number.isInteger(num) || num < 0) {
    throw new Error("Base62 encoding only supports non-negative integers");
  }

  if (num === 0) {
    return BASE62_ALPHABET[0];
  }

  const base: number = BASE62_ALPHABET.length;
  let result: string = "";
  let n: number = num;

  while (n > 0) {
    const remainder: number = n % base;
    result = BASE62_ALPHABET[remainder] + result;
    n = Math.floor(n / base);
  }

  return result;
}
