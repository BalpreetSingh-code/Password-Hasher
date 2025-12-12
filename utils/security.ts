
// --- Hashing Utilities ---

export const generateSalt = (length = 16): string => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const hashWithSHA = async (message: string, algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512'): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest(algorithm, msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const hashWithPBKDF2 = async (password: string, saltHex: string, iterations: number = 100000): Promise<string> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Convert hex salt back to buffer
  const saltBuffer = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// --- Strength Estimation Utilities ---

export const calculateEntropy = (password: string): number => {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) return 0;
  return Math.round(password.length * Math.log2(poolSize));
};

export const getStrengthScore = (password: string): { score: number; label: string; color: string } => {
  const entropy = calculateEntropy(password);

  if (entropy < 28) return { score: 1, label: 'Very Weak', color: 'bg-red-500' };
  if (entropy < 36) return { score: 2, label: 'Weak', color: 'bg-orange-500' };
  if (entropy < 60) return { score: 3, label: 'Reasonable', color: 'bg-yellow-500' };
  if (entropy < 128) return { score: 4, label: 'Strong', color: 'bg-green-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-green-700' };
};
