import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, saltHex, keyHex] = storedHash.split('$');
  if (
    algorithm !== 'scrypt' ||
    !/^[a-f\d]{32}$/i.test(saltHex ?? '') ||
    !/^[a-f\d]{128}$/i.test(keyHex ?? '')
  ) {
    return false;
  }
  const expectedKey = Buffer.from(keyHex, 'hex');
  const actualKey = await deriveKey(password, Buffer.from(saltHex, 'hex'));
  return timingSafeEqual(actualKey, expectedKey);
}
