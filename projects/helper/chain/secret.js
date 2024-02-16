const { endPoints } = require('./cosmos');
const EnigmaUtils = require('../utils/enigma')
const host = endPoints.secret
const { toBase64, fromBase64, fromUtf8, } = EnigmaUtils
const axios = require('axios')
let client

function getClient() {
  if (!client) client = new SecretClient(host)
  return client
}

async function queryContract({ contract, data,  } = {}) {
  return getClient().queryContractSmart({contract, data,})
} 
async function getContracts(codeId) {
  return getClient().getContracts(codeId)
} 


module.exports = {
  queryContract,
  getContracts,
}

class SecretClient {
  constructor(nodeURL) {
    this.nodeURL = nodeURL
    this.codeHashes = {}
    this.enigmautils = new EnigmaUtils(nodeURL)
  }

  async getContracts(codeId) {
    const path = `/compute/v1beta1/contracts/${codeId}`;
    const { contract_infos } = (await this.get(path));
    return contract_infos.map(({ contract_address, ContractInfo: { code_id, creator, label } }) => ({
      address: contract_address,
      code_id, creator, label,
    }));
  }

  async queryContractSmart({ contract, data }) {
    const contractCodeHash = await this.getCodeHashByContractAddr(contract);
    const encrypted = await this.enigmautils.encrypt(contractCodeHash, data);
    const nonce = encrypted.slice(0, 32);
    const encoded = toBase64(encrypted);
    const path = `/compute/v1beta1/query/${contract}`;
    let responseData = (await this.get(path, { query: encoded })).data
    // By convention, smart queries must return a valid JSON document (see https://github.com/CosmWasm/cosmwasm/issues/144)
    return JSON.parse(fromUtf8(fromBase64(fromUtf8(await this.enigmautils.decrypt(fromBase64(responseData), nonce)))));

  }

  async get(api, queryParams = {}) {
    const { data } = await axios.get(this.nodeURL + api, { params: queryParams })
    return data
  }

  async getCodeHashByContractAddr(contract) {
    if (!this.codeHashes[contract])
      this.codeHashes[contract] = fetchCodeHash(this)

    return this.codeHashes[contract]

    async function fetchCodeHash(obj) {
      const { code_hash } = await obj.get(`/compute/v1beta1/code_hash/by_contract_address/${contract}`)
      return code_hash
    }
  }

}