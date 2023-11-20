const axios = require("axios")
const basex = require('base-x')

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const bs58 = basex(ALPHABET)

const API_HOST = 'https://backend-v115.mainnet.alephium.org'

async function getAlphBalance(address) {
  return (await axios.get(`${API_HOST}/addresses/${address}/balance`)).data
}

async function getTokensBalance(address) {
  return (await axios.get(`${API_HOST}/addresses/${address}/tokens-balance`)).data
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
   contractIdFromAddress
}
