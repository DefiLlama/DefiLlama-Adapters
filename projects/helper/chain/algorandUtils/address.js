const base32 = require('hi-base32');
const sha512 = require('js-sha512');

const ALGORAND_CHECKSUM_BYTE_LENGTH = 4;
const ALGORAND_ADDRESS_LENGTH = 58;
const PUBLIC_KEY_LENGTH = 32

const APP_ID_PREFIX = Buffer.from('appID');

/**
 * encodeAddress takes an Algorand address as a Uint8Array and encodes it into a string with checksum.
 * @param address - a raw Algorand address
 * @returns the address and checksum encoded as a string.
 */
function encodeAddress(address) {
  // compute checksum
  const checksum = genericHash(address)
    .slice(
      PUBLIC_KEY_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH,
      PUBLIC_KEY_LENGTH
    );
  const addr = base32.encode(concatArrays(address, checksum));

  return addr.toString().slice(0, ALGORAND_ADDRESS_LENGTH); // removing the extra '===='
}

/**
 * Get the escrow address of an application.
 * @param appID - The ID of the application.
 * @returns The address corresponding to that application's escrow account.
 */
function getApplicationAddress(appID) {
  const toBeSigned = concatArrays(APP_ID_PREFIX, encodeUint64(appID));
  const hash = genericHash(toBeSigned);
  return encodeAddress(new Uint8Array(hash));
}

function concatArrays(...arrs) {
  const size = arrs.reduce((sum, arr) => sum + arr.length, 0);
  const c = new Uint8Array(size);

  let offset = 0;
  for (let i = 0; i < arrs.length; i++) {
    c.set(arrs[i], offset);
    offset += arrs[i].length;
  }

  return c;
}

function encodeUint64(num) {
  const isInteger = typeof num === 'bigint' || Number.isInteger(num);

  if (!isInteger || num < 0 || num > BigInt('0xffffffffffffffff')) {
    throw new Error('Input is not a 64-bit unsigned integer');
  }

  const buf = Buffer.allocUnsafe(8);

  buf.writeBigUInt64BE(BigInt(num));

  return new Uint8Array(buf);
}

function genericHash(arr) {
  return sha512.sha512_256.array(arr);
}

module.exports = {
  encodeAddress,
  getApplicationAddress,
}