
const miscreant = require("miscreant");
const { toUtf8, fromBase64 } = require('@cosmjs/encoding')
const curve25519_js_1 = require("curve25519-js");
const secureRandom = require("secure-random");
const hkdf = require("js-crypto-hkdf");
const { get } = require('../http')

const cryptoProvider = new miscreant.PolyfillCryptoProvider();
const hkdfSalt = Uint8Array.from([
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x02,
  0x4b,
  0xea,
  0xd8,
  0xdf,
  0x69,
  0x99,
  0x08,
  0x52,
  0xc2,
  0x02,
  0xdb,
  0x0e,
  0x00,
  0x97,
  0xc1,
  0xa1,
  0x2e,
  0xa6,
  0x37,
  0xd7,
  0xe9,
  0x6d,
]);

class EnigmaUtils {
  constructor(apiUrl) {
    this.consensusIoPubKey = new Uint8Array(); // cache
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
    return secureRandom(32, { type: "Uint8Array" });
  }
  static GenerateNewKeyPairFromSeed(seed) {
    const { private: privkey, public: pubkey } = curve25519_js_1.generateKeyPair(seed);
    return { privkey, pubkey };
  }
  async getConsensusIoPubKey() {
    if (this.consensusIoPubKey.length === 32) {
      return this.consensusIoPubKey;
    }
    const { result: { TxKey }, } = await get(this.apiUrl + "/reg/tx-key");
    this.consensusIoPubKey = fromBase64(TxKey);
    return this.consensusIoPubKey;
  }
  async getTxEncryptionKey(nonce) {
    const consensusIoPubKey = await this.getConsensusIoPubKey();
    const txEncryptionIkm = curve25519_js_1.sharedKey(this.privkey, consensusIoPubKey);
    const { key: txEncryptionKey } = await hkdf.compute(Uint8Array.from([...txEncryptionIkm, ...nonce]), "SHA-256", 32, "", hkdfSalt);
    return txEncryptionKey;
  }
  async encrypt(contractCodeHash, msg) {
    const nonce = secureRandom(32, {
      type: "Uint8Array",
    });
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
    //console.log(`decrypt tx encryption key: ${Encoding.toHex(txEncryptionKey)}`);
    const siv = await miscreant.SIV.importKey(txEncryptionKey, "AES-SIV", cryptoProvider);
    const plaintext = await siv.open(ciphertext, [new Uint8Array()]);
    return plaintext;
  }
  getPubkey() {
    return Promise.resolve(this.pubkey);
  }
}

module.exports = EnigmaUtils