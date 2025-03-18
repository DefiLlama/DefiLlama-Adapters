/* eslint no-bitwise: ["error", {"allow": ["<<", ">>", "^", "&", "&="]}] */

const base32 = require('hi-base32');

const versionBytes = {
  ed25519PublicKey: 6 << 3, // G (when encoded in base32)
  ed25519SecretSeed: 18 << 3, // S
  med25519PublicKey: 12 << 3, // M
  preAuthTx: 19 << 3, // T
  sha256Hash: 23 << 3, // X
  signedPayload: 15 << 3, // P
  contract: 2 << 3 // C
};

function decodeCheck(versionByteName, encoded) {
  if (typeof encoded !== 'string') {
    throw new TypeError('encoded argument must be of type String');
  }

  const decoded = base32.decode.asBytes(encoded);
  const versionByte = decoded[0];
  const payload = decoded.slice(0, -2);
  const data = payload.slice(1);

  if (encoded !== base32.encode(decoded)) {
    throw new Error('invalid encoded string');
  }

  const expectedVersion = versionBytes[versionByteName];

  if (expectedVersion === undefined) {
    throw new Error(
      `${versionByteName} is not a valid version byte name. ` +
        `Expected one of ${Object.keys(versionBytes).join(', ')}`
    );
  }

  if (versionByte !== expectedVersion) {
    throw new Error(
      `invalid version byte. expected ${expectedVersion}, got ${versionByte}`
    );
  }

  return Buffer.from(data);
}

module.exports = {
  decodeCheck,
}
