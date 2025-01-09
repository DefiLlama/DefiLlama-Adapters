const axios = require("axios");
const basex = require("base-x");

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = basex(ALPHABET);

const EXPLORER_API_HOST = "https://backend.mainnet.alephium.org";
const NODE_API_HOST = "https://node.mainnet.alephium.org";

async function getAlphBalance(address) {
  return (await axios.get(`${EXPLORER_API_HOST}/addresses/${address}/balance`))
    .data;
}

async function getTokensBalance(address) {
  return (
    await axios.get(`${EXPLORER_API_HOST}/addresses/${address}/tokens-balance`)
  ).data;
}

async function contractMultiCall(payload) {
  const result = (
    await axios.post(`${NODE_API_HOST}/contracts/multicall-contract`, {
      calls: payload,
    })
  ).data;
  return result.results.map((r) => tryGetCallResult(r));
}

function tryGetCallResult(result) {
  if (result.type === "CallContractFailed") {
    throw new Error(`Failed to call contract, error: ${result.error}`);
  }
  return result;
}

async function getTokenInfo(tokenId) {
  const [metadata] = (
    await axios.post(`${EXPLORER_API_HOST}/tokens/fungible-metadata`, [tokenId])
  ).data;

  return metadata;
}

function contractIdFromAddress(address) {
  const decoded = bs58.decode(address);

  if (decoded.length == 0) throw new Error("Address string is empty");
  const addressType = decoded[0];
  const addressBody = decoded.slice(1);

  if (addressType == 0x03) {
    return Buffer.from(addressBody).toString("hex");
  } else {
    throw new Error(`Invalid contract address type: ${addressType}`);
  }
}

function hexToBinUnsafe(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
}

function addressFromContractId(contractId) {
  const hash = hexToBinUnsafe(contractId);
  const bytes = new Uint8Array([0x03, ...hash]);
  return bs58.encode(bytes);
}

async function sumTokens({ owners = [], owner }) {
  if (owner) owners = [owner];
  let total = 0
  for (const owner of owners)
    total += (await getAlphBalance(owner)).balance / 1e18

  return {
    alephium: total
  }
}

module.exports = {
  sumTokens,
  getAlphBalance,
  getTokensBalance,
  getTokenInfo,
  contractIdFromAddress,
  addressFromContractId,
  contractMultiCall,
};
