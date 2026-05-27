import CryptoJS from 'crypto-js';

export const encrypt = (message: string, chatId: string): string => {
  return CryptoJS.AES.encrypt(message, chatId).toString();
};

export const decrypt = (cipherText: string, chatId: string): string => {
  const bytes = CryptoJS.AES.decrypt(cipherText, chatId);
  return bytes.toString(CryptoJS.enc.Utf8);
};
