const { get, post, } = require('../http')
const ADDRESSES = require('../coreAssets.json')
const plimit = require('p-limit')
const _rateLimited = plimit(9)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const { sumTokens2 } = require('../unwrapLPs')
const tonUtils = require('../utils/ton')
const { getUniqueAddresses, sleep, sliceIntoChunks } = require('../utils')
require('dotenv').config()

const key = process.env.TONCENTER_API_KEY;

async function getTonBalance(addr) {
  const res = await get(`https://toncenter.com/api/v3/account?address=${addr}` + (key ? `?api_key=${key}` : ''))
  return res.balance
}

async function getJettonBalances(addr) {
  const response = await get(`https://tonapi.io/v2/accounts/${addr}/jettons?currencies=usd`)

  const res = {}
  response.balances.forEach(val => {
    res[val.jetton.address] = { balance: val.balance, price: val.price.prices.USD, decimals: val.jetton.decimals }
  })

  return res
}

async function _sumTokensAccount({ api, addr, tokens = [], onlyWhitelistedTokens = false, useTonApiForPrices = true, }) {
  if (onlyWhitelistedTokens && tokens.length === 1 && tokens.includes(ADDRESSES.ton.TON)) return;
  const { balances } = await get(`https://tonapi.io/v2/accounts/${addr}/jettons?currencies=usd`)
  await sleep(1000 * (3 * Math.random() + 3))
  tokens = tokens.map((a) => {
    if (a === ADDRESSES.ton.TON) return ADDRESSES.ton.TON
    return tonUtils.address(a).toString()
  })
  balances.forEach(({ balance, price, jetton }) => {
    const address = tonUtils.address(jetton.address).toString()
    if (onlyWhitelistedTokens && !tokens.includes(address)) return;
    if (!useTonApiForPrices) {
      api.add(address, balance)
      return;
    }
    const decimals = jetton.decimals
    price = price?.prices?.USD
    if (!decimals || !price) {
      api.add(address, balance)
      return;
    }
    const bal = balance * price / 10 ** decimals
    api.add('tether', bal, { skipChain: true })
  })
}

async function getTokenRates({ tokens = [] }) {
  const { rates } = await get(`https://tonapi.io/v2/rates?` + (
    new URLSearchParams({ tokens: tokens.join(','), currencies: "usd" })
  ).toString());

  const tokenPrices = {};

  tokens.forEach(tokenAddress => {
    if (rates[tokenAddress]) {
      const usdPrice = rates[tokenAddress].prices.USD;
      tokenPrices[tokenAddress] = usdPrice;
    }
  });

  return tokenPrices
}

async function getJettonsInfo(tokens){
  const result = []
  for (let chunk of sliceIntoChunks(tokens, 100)) {
    result.push(...(await post("https://tonapi.io/v2/jettons/_bulk", {"account_ids": chunk}))["jettons"])
  }
  return result
}

const sumTokensAccount = rateLimited(_sumTokensAccount)

async function sumTokens({ api, tokens, owners = [], owner, onlyWhitelistedTokens = false, useTonApiForPrices = true }) {
  if (!api) throw new Error('api is required')

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners, api.chain)

  if (tokens.includes(ADDRESSES.null)) await addTonBalances({ api, addresses: owners })
  if (onlyWhitelistedTokens && tokens.length === 1 && tokens.includes(ADDRESSES.ton.TON)) return sumTokens2({ api, })

  for (const addr of owners) {
    await sleep(1000 * (3 * Math.random() + 7))
    await sumTokensAccount({ api, addr, tokens, onlyWhitelistedTokens, useTonApiForPrices })
  }
  return sumTokens2({ api, })
}

function sumTokensExport({ ...args }) {
  return (api) => sumTokens({ api, ...args })
}

async function call({ target, abi, params = [], rawStack = false, }) {
  const requestBody = {
    "address": target,
    "method": abi,
    "stack": params
  }

  const { ok, result } = await post('https://toncenter.com/api/v2/runGetMethod' + (key ? `?api_key=${key}` : ''), requestBody)
  if (!ok) {
    throw new Error("Unknown");
  }
  const { exit_code, stack } = result
  if (exit_code !== 0) {
    throw new Error('Expected a zero exit code, but got ' + exit_code)
  }

  if (rawStack) return stack

  stack.forEach((i, idx) => {
    if (i[0] === 'num') {
      stack[idx] = parseInt(i[1], 16)
    }
  })

  return stack
}

async function addJettonBalances({ api, jettonAddress, addresses }) {
  api.log('Fetching Jetton balances', { jettonAddress, addresses: addresses.length })
  const chunks = sliceIntoChunks(addresses, 399)
  let i = 0
  for (const chunk of chunks) {
    api.log('Fetching Jetton balances', { jettonAddress, chunk: i++, chunks: chunks.length })
    const { jetton_wallets } = await get('https://toncenter.com/api/v3/jetton/wallets?owner_address=' + encodeURIComponent(chunk.join(',')) + '&jetton_address=' + encodeURIComponent(jettonAddress) + '&include_boc=false' + (key ? `&api_key=${key}` : ''))
    jetton_wallets.forEach(({ balance }) => {
      api.add(jettonAddress, balance)
    })
    if (addresses.length > 199) {
      await sleep(3000)
    }
  }
}

async function addTonBalances({ api, addresses }) {
  api.log('Fetching TON balances', { addresses: addresses.length })
  const chunks = sliceIntoChunks(addresses, 399)
  let i = 0
  for (const chunk of chunks) {
    api.log('Fetching TON balances', { chunk: i++, chunks: chunks.length })
    const { accounts } = await get('https://toncenter.com/api/v3/accountStates?address=' + encodeURIComponent(chunk.join(',')) + '&include_boc=false' + (key ? `&api_key=${key}` : ''))
    accounts.forEach(({ balance }) => {
      api.add(ADDRESSES.null, balance)
    })
    if (addresses.length > 199) {
      await sleep(3000)
    }
  }
}

function processTVMSliceReadAddress(base64String) {
  let buffer = decodeBase64(base64String);
  let { offset, root, index, cellData } = parseBoc(buffer);
  let { wc, addressHash } = parseAddress(buffer, offset);
  return serializeAddress(wc, addressHash);
}

function decodeBase64(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  return buffer;
}

function parseBoc(buffer) {
  if (buffer.length < 4) {
      throw new Error("Buffer is too short to contain magic bytes");
  }

  const magic = buffer.readUInt32BE(0);
  if (magic !== 0xb5ee9c72) {
      throw new Error("Invalid magic");
  }

  let offset = 4; 

  let hasIdx = (buffer[offset] >> 7) & 1;
  let hasCrc32c = (buffer[offset] >> 6) & 1;
  let hasCacheBits = (buffer[offset] >> 5) & 1;
  let flags = (buffer[offset] >> 3) & 0b11; // 2 bits
  let size = buffer[offset] & 0b111; // 3 bits
  offset++;

  let offBytes = buffer.readUInt8(offset);
  offset++;

  let cells = buffer.readUIntBE(offset, size);
  offset += size;

  let roots = buffer.readUIntBE(offset, size);
  offset += size;

  let absent = buffer.readUIntBE(offset, size);
  offset += size;

  let totalCellSize = buffer.readUIntBE(offset, offBytes);
  offset += offBytes;

  let root = [];
  for (let i = 0; i < roots; i++) {
      root.push(buffer.readUIntBE(offset, size));
      offset += size;
  }

  let index = null;
  if (hasIdx) {
      index = buffer.slice(offset, offset + cells * offBytes);
      offset += cells * offBytes;
  }

  let cellData = buffer.slice(offset, offset + totalCellSize);
  offset += totalCellSize;

  return { offset, root, index, cellData };
}

function parseAddress(buffer, offset) {
  const wcByteOffset = 13;
  const wcBitsOffset = 3;
  let reader = new BitReader(buffer, wcByteOffset, wcBitsOffset); 

  let wc = (reader.readBits(5) << 3) | (reader.readBits(3)); 
  let addressHash = reader.readBytes(32); 

  return { wc, addressHash, offset: reader.byteOffset }; 
}

function serializeAddress(wc, addressHash) {
  const bounceableTag = 0x11;
  let fullAddress = Buffer.alloc(36);
  fullAddress[0] = bounceableTag;
  fullAddress[1] = wc;
  addressHash.copy(fullAddress, 2);

  let crc16 = computeCRC16(fullAddress.slice(0, 34));
  fullAddress.writeUInt16BE(crc16, 34);

  return fullAddress.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

function computeCRC16(buffer) {
  let crc = 0x0000;
  let polynomial = 0x1021;

  for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i] << 8;
      for (let j = 0; j < 8; j++) {
          if (crc & 0x8000) {
              crc = (crc << 1) ^ polynomial;
          } else {
              crc <<= 1;
          }
      }
      crc &= 0xFFFF;
  }
  return crc;
}

class BitReader {
  constructor(buffer, startByte = 0, startBit = 0) {
      this.buffer = buffer;
      this.byteOffset = startByte;
      this.bitOffset = startBit;
  }

  readBits(n) {
      let value = 0;

      for (let i = 0; i < n; i++) {
          if (this.byteOffset >= this.buffer.length) {
              throw new Error("Buffer overflow while reading bits");
          }

          let bit = (this.buffer[this.byteOffset] >> (7 - this.bitOffset)) & 1;
          value = (value << 1) | bit;

          this.bitOffset++;
          if (this.bitOffset === 8) {
              this.bitOffset = 0;
              this.byteOffset++;
          }
      }
      return value;
  }

  readBytes(n) {
      let bytes = Buffer.alloc(n);
      for (let i = 0; i < n; i++) {
          bytes[i] = this.readBits(8);
      }
      return bytes;
  }
}

module.exports = {
  addTonBalances,
  addJettonBalances,
  getTonBalance,
  getTokenRates,
  sumTokens,
  sumTokensExport,
  call,
  getJettonBalances,
  getJettonsInfo,
  rateLimited,
  processTVMSliceReadAddress
}