
const miscreant = require("miscreant");
const curve25519 = require("curve25519-js");
const { get } = require('../http')

// const crypto = require('node:crypto')  // -- can be used for node v16 and above
// const hkdf = require("js-crypto-hkdf") // -- needed for node v14 and below
const toBase64 = str => Buffer.from(str).toString('base64')
const fromBase64 = str => Buffer.from(str, 'base64')


const cryptoProvider = new miscreant.PolyfillCryptoProvider();
const hkdfSalt = Uint8Array.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x4b, 0xea, 0xd8, 0xdf, 0x69, 0x99, 0x08, 0x52, 0xc2, 0x02, 0xdb, 0x0e, 0x00, 0x97, 0xc1, 0xa1, 0x2e, 0xa6, 0x37, 0xd7, 0xe9, 0x6d,]);

class EnigmaUtils {
  constructor(apiUrl) {
    this.consensusIoPubKey = null; // cache
    this.apiUrl = apiUrl;
    this.seed = EnigmaUtils.GenerateNewSeed();
    const { privkey, pubkey } = EnigmaUtils.GenerateNewKeyPairFromSeed(this.seed);
    this.privkey = privkey;
    this.pubkey = pubkey;
  }
  static GenerateNewKeyPair() {
    return EnigmaUtils.GenerateNewKeyPairFromSeed(EnigmaUtils.GenerateNewSeed());
  }
  static GenerateNewSeed() {
    return new Uint8Array(Buffer.alloc(32, 0)) // We dont care about true random
  }
  static GenerateNewKeyPairFromSeed(seed) {
    const { private: privkey, public: pubkey } = curve25519.generateKeyPair(seed);
    return { privkey, pubkey };
  }
  async getConsensusIoPubKey() {
    if (this.consensusIoPubKey) return this.consensusIoPubKey
    if (!this.getKey) {
      this.getKey = get(this.apiUrl + "/reg/tx-key")
    }

    const { result: { TxKey }, } = await this.getKey
    this.consensusIoPubKey = fromBase64(TxKey);
    return this.consensusIoPubKey;
  }
  async getTxEncryptionKey(nonce) {
    // const consensusIoPubKey = await this.getConsensusIoPubKey();
    // const txEncryptionIkm = curve25519.sharedKey(this.privkey, consensusIoPubKey);
    // const txEncryptionKey = crypto.hkdfSync("sha256", Uint8Array.from([...txEncryptionIkm, ...nonce]), hkdfSalt, '', 32)
    // const { key: txEncryptionKey } = await hkdf.compute(Uint8Array.from([...txEncryptionIkm, ...nonce]), "SHA-256", 32, "", hkdfSalt)
    // console.log(txEncryptionKey, 'txEncryptionKey', new Uint8Array(txEncryptionKey))
    const txEncryptionKey = fakeKey
    return new Uint8Array(txEncryptionKey)
  }
  async encrypt(contractCodeHash, msg) {
    const nonce = new Uint8Array(Buffer.alloc(32, 0)) // We dont care about true random
    const txEncryptionKey = await this.getTxEncryptionKey(nonce);
    const siv = await miscreant.SIV.importKey(txEncryptionKey, "AES-SIV", cryptoProvider);
    const plaintext = toUtf8(contractCodeHash + JSON.stringify(msg));
    const ciphertext = await siv.seal(plaintext, [new Uint8Array()]);
    // ciphertext = nonce(32) || wallet_pubkey(32) || ciphertext
    return Uint8Array.from([...nonce, ...this.pubkey, ...ciphertext]);
  }
  async decrypt(ciphertext, nonce) {
    var _a;
    if (!((_a = ciphertext) === null || _a === void 0 ? void 0 : _a.length)) {
      return new Uint8Array();
    }
    const txEncryptionKey = await this.getTxEncryptionKey(nonce);
    //sdk.log(`decrypt tx encryption key: ${Encoding.toHex(txEncryptionKey)}`);
    const siv = await miscreant.SIV.importKey(txEncryptionKey, "AES-SIV", cryptoProvider);
    const plaintext = await siv.open(ciphertext, [new Uint8Array()]);
    return plaintext;
  }
  getPubkey() {
    return Promise.resolve(this.pubkey);
  }
}

function toUtf8(str) {
  return new TextEncoder().encode(str);
}

function fromUtf8(data) {
  return new TextDecoder("utf-8", { fatal: true }).decode(data);
}

function toHex(data) {
  let out = "";
  for (const byte of data) {
    out += ("0" + byte.toString(16)).slice(-2);
  }
  return out;
}

function fromHex(hexstring) {
  if (hexstring.length % 2 !== 0) {
    throw new Error("hex string length must be a multiple of 2");
  }
  const out = new Uint8Array(hexstring.length / 2);
  for (let i = 0; i < out.length; i++) {
    const j = 2 * i;
    const hexByteAsString = hexstring.slice(j, j + 2);
    if (!hexByteAsString.match(/[0-9a-f]{2}/i)) {
      throw new Error("hex string contains invalid characters");
    }
    out[i] = parseInt(hexByteAsString, 16);
  }
  return out;
}

EnigmaUtils.fromHex = fromHex
EnigmaUtils.toHex = toHex
EnigmaUtils.toUtf8 = toUtf8
EnigmaUtils.fromUtf8 = fromUtf8
EnigmaUtils.fromBase64 = fromBase64
EnigmaUtils.toBase64 = toBase64

module.exports = EnigmaUtils

const fakeKey = new Uint8Array([248, 24, 153, 160, 20, 71, 22, 226, 185, 239, 57, 17, 11, 65, 67, 231, 36, 199, 102, 223, 164, 45, 133, 137, 223, 33, 119, 169, 155, 169, 194, 224]).buffer