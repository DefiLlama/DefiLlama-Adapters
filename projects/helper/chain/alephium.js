const axios = require("axios")
const basex = require('base-x')

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const bs58 = basex(ALPHABET)

const EXPLORER_API_HOST = 'https://backend-v115.mainnet.alephium.org'
const NODE_API_HOST = 'https://node.mainnet.alephium.org'

async function getAlphBalance(address) {
  return (await axios.get(`${EXPLORER_API_HOST}/addresses/${address}/balance`)).data
}

async function getTokensBalance(address) {
  return (await axios.get(`${EXPLORER_API_HOST}/addresses/${address}/tokens-balance`)).data
}

async function contractMultiCall(payload) {
  const result = (await axios.post(`${NODE_API_HOST}/contracts/multicall-contract`, {calls: payload})).data
  return result.results.map((r) => tryGetCallResult(r))
}

function tryGetCallResult(result) {
  if (result.type === 'CallContractFailed') {
    throw new Error(`Failed to call contract, error: ${result.error}`)
  }
  return result
}

function contractIdFromAddress(address) {
  const decoded = bs58.decode(address)

  if (decoded.length == 0) throw new Error('Address string is empty')
  const addressType = decoded[0]
  const addressBody = decoded.slice(1)

  if (addressType == 0x03) {
    return Buffer.from(addressBody).toString('hex')
  } else {
    throw new Error(`Invalid contract address type: ${addressType}`)
  }
}

module.exports = {
   getAlphBalance,
   getTokensBalance,
   contractIdFromAddress,
   contractMultiCall
}
