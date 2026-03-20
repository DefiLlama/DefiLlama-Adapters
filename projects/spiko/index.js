const base32 = require('hi-base32')
const { multiCall } = require('../helper/chain/starknet')
const { post } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

const SOROBAN_RPC_URL = 'https://soroban-rpc.creit.tech/'

// Order per chain: SAFO (USD), eurSAFO (EUR), gbpSAFO (GBP), chfSAFO (CHF)
const config = {
  ethereum: [
    '0xcbade7d9bdee88411cb6cbcbb29952b742036992',
    '0x0990b149e915cb08e2143a5c6f669c907eddc8b0',
    '0xc273986a91e4bfc543610a5cb5860b7cfefb6cc0',
    '0x18b5c15e5196a38a162b1787875295b76e4313fb',
  ],
  polygon: [
    '0x6f64f47f95cf656f21b40e14798f6b49f80b3dc5',
    '0x272ea767712cc4839f4a27ee35eb73116158c8a2',
    '0x4fe515c67eeeadb3282780325f09bb7c244fe774',
    '0x9de2b2dcdcf43540e47143f28484b6d15118f089',
  ],
  arbitrum: [
    '0x0c709396739b9cfb72bcea6ac691ce0ddf66479c',
    '0x1412632f2b89e87bfa20c1318a43ced25f1d7b76',
    '0xbe023308ac2ef7e1c3799f4e6a3003ee6d342635',
    '0x97e7962bcd091e7ecfb583fc96289b1e1553ac6e',
  ],
  base: [
    '0x0bb754d8940e283d9ff6855ab5dafbc14165c059',
    '0xd879846cbe20751bde8a9342a3cca00a3e56ca47',
    '0x2f6c0e5e06b43512706a9cdf66cd21f723fe0ec3',
    '0xd9aa2300e126869182dfb6ecf54984e4c687f36b',
  ],
  starknet: [
    '0x035bdc17f7a7d09c45d31ab476a576d4f7aad916676b2948fe172c3bcb33725a',
    '0x0128f41ef8017ab56140ffad6439305a3196ed862841ba61ff4d78e380c346a6',
    '0x06e8a99926ff6d56f4cb93c37b63286d736cd1f81740d53f88b4875b4cbe7f49',
    '0x06723dcb428eddb160c5adfc2d0a5e5adc184bf6a7298780c3cbf3fa764f709b',
  ],
  etlk: [
    '0x5677a4dc7484762ffccee13cba20b5c979def446',
    '0x35dfec1813c43d82e6b87c682f560bbb8ea0c121',
    '0xfe20ebe3881491b2e158b9d10cb95bcfa652262d',
    '0xef53e7d17822b641c6481837238a64a688709301',
  ],
  stellar: [
    { contract: 'CDGSC6BA4TCAOVSFQCUEHDMOIIHYYVNYBT6YEARS4MX3ITAHUINVGQHX', target: '0xcbade7d9bdee88411cb6cbcbb29952b742036992' },
    { contract: 'CBOOCGZSVRSZFRE4U2NWR2B4RXYVJWRCBTGOUD2JPI2TDJPWMTJX7FZP', target: '0x0990b149e915cb08e2143a5c6f669c907eddc8b0' },
    { contract: 'CAGYRRKPFSWKM6SJOE4QAAVYMOSHMDS5WOQ4T5A2E6XNCU7LZZKUNQKP', target: '0xc273986a91e4bfc543610a5cb5860b7cfefb6cc0' },
    { contract: 'CAJD2IBSP7VO2VYJQUYJSOGPJINTUYV7MQITINXVPTIH3CCLCUENNMW4', target: '0x18b5c15e5196a38a162b1787875295b76e4313fb' },
  ],
}

const totalSupplyAbi = {
  name: 'totalSupply',
  type: 'function',
  inputs: [],
  outputs: [{ name: 'totalSupply', type: 'uint256' }],
  stateMutability: 'view',
}

function decodeStrKey(strKey) {
  const raw = Buffer.from(base32.decode.asBytes(strKey))
  return raw.slice(1, -2)
}

const STELLAR_LEDGER_ENTRY_CONTRACT_DATA = 6
const STELLAR_SC_ADDRESS_TYPE_CONTRACT = 1
const STELLAR_SCVAL_LEDGER_KEY_CONTRACT_INSTANCE = 20
const STELLAR_CONTRACT_DATA_PERSISTENT = 1

function buildContractInstanceKey(contract) {
  const payload = decodeStrKey(contract)
  const buf = Buffer.alloc(48)
  let offset = 0
  buf.writeUInt32BE(STELLAR_LEDGER_ENTRY_CONTRACT_DATA, offset)
  offset += 4
  buf.writeUInt32BE(STELLAR_SC_ADDRESS_TYPE_CONTRACT, offset)
  offset += 4
  payload.copy(buf, offset)
  offset += 32
  buf.writeUInt32BE(STELLAR_SCVAL_LEDGER_KEY_CONTRACT_INSTANCE, offset)
  offset += 4
  buf.writeUInt32BE(STELLAR_CONTRACT_DATA_PERSISTENT, offset)
  return buf.toString('base64')
}

function parseTotalSupplyFromEntry(xdr) {
  const buf = Buffer.from(xdr, 'base64')
  const marker = Buffer.from('TotalSupply')
  const idx = buf.indexOf(marker)
  if (idx === -1) throw new Error('TotalSupply not found in contract storage')
  const len = buf.readUInt32BE(idx - 4)
  let offset = idx + len
  offset += (4 - (len % 4)) % 4
  const type = buf.readUInt32BE(offset)
  if (type !== 10) throw new Error('Unexpected TotalSupply type')
  const hi = buf.readBigInt64BE(offset + 4)
  const lo = buf.readBigUInt64BE(offset + 12)
  let value = (hi << 64n) + lo
  if (hi < 0n) value = -(((-hi) << 64n) - lo)
  return value.toString()
}

async function fetchStellarSupply(contract) {
  const key = buildContractInstanceKey(contract)
  const data = await post(SOROBAN_RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'getLedgerEntries',
    params: { keys: [key] },
  })
  const entry = data?.result?.entries?.[0]
  if (!entry?.xdr) throw new Error(`Missing contract data for ${contract}`)
  return parseTotalSupplyFromEntry(entry.xdr)
}

module.exports = {
  methodology: "Counts each Spiko share class token's circulating supply (totalSupply) and prices it via DefiLlama's token pricing pipeline.",
}

Object.keys(config).forEach((chain) => {
  const assets = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'stellar') {
        const supplies = await Promise.all(assets.map(({ contract }) => fetchStellarSupply(contract)))
        supplies.forEach((supply, i) => {
          const { target } = assets[i]
          api.add(`ethereum:${target}`, supply, { skipChain: true })
        })
        return api.getBalances()
      }
      let supplies
      if (chain === 'starknet')
        supplies = await multiCall({ abi: totalSupplyAbi, calls: assets })
      else
        supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: assets })
      api.add(assets, supplies)
      return sumTokens2({ api })
    },
  }
})
