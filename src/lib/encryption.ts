import Cryptr from "cryptr";

// Generate a default key if ENCRYPTION_KEY is not set
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ||
  'default-encryption-key-for-development-please-set-ENCRYPTION_KEY-in-production';

const cryptr = new Cryptr(ENCRYPTION_KEY);


export const encrypt = (text: string) => {
  return cryptr.encrypt(text);
}

export const decrypt = (text: string) => {
  return cryptr.decrypt(text);
}
