const { get } = require('./http')
const EnigmaUtils = require('./utils/enigma')
const { toBase64, fromBase64, toUtf8, fromUtf8, toHex,  }  = EnigmaUtils

class CosmWasmClient {
  constructor(nodeURL) {
    this.nodeURL = nodeURL
    this.codeHashCache = {}
    this.enigmautils = new EnigmaUtils(nodeURL)
  }

  async getHeight() {
    const latest = await this.get('/blocks/latest')
    return parseInt(latest.block.header.height, 10)
  }

  async queryContractSmart(contractAddress, query, addedParams) {
    const contractCodeHash = await this.getCodeHashByContractAddr(contractAddress);
    const encrypted = await this.enigmautils.encrypt(contractCodeHash, query);
    const nonce = encrypted.slice(0, 32);
    const encoded = toHex(toUtf8(toBase64(encrypted)));
    // @ts-ignore
    const paramString = new URLSearchParams(addedParams).toString();
    const path = `/wasm/contract/${contractAddress}/query/${encoded}?encoding=hex&${paramString}`;
    let responseData = (await this.get(path))
    // By convention, smart queries must return a valid JSON document (see https://github.com/CosmWasm/cosmwasm/issues/144)
    return JSON.parse(fromUtf8(fromBase64(fromUtf8(await this.enigmautils.decrypt(fromBase64(responseData.result.smart), nonce)))));

  }

  async get(api) {
    return get(this.nodeURL + api)
  }

  async getContracts(codeId) {
    const path = `/wasm/code/${codeId}/contracts`;
    const responseData = (await this.get(path));
    const result = responseData.result || [];
    return result.map((entry) => ({
      address: entry.address,
      codeId: entry.code_id,
      creator: entry.creator,
      label: entry.label,
    }));
  }

  async getCodeHashByContractAddr(addr) {
    const codeHashFromCache = this.codeHashCache[addr];
    if (typeof codeHashFromCache === "string")
      return codeHashFromCache;

    const path = `/wasm/contract/${addr}/code-hash`;
    const responseData = await this.get(path);
    this.codeHashCache[addr] = responseData.result
    return responseData.result;
  }

}

module.exports = CosmWasmClient