const base32 = require('hi-base32')
const { multiCall } = require('../helper/chain/starknet')
const { post } = require('../helper/http')
const { getUniqueAddresses } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')

const SOROBAN_RPC_URL = 'https://soroban-rpc.creit.tech/'

/**
 * Share-register addresses from Spiko prospectus / Spiko_DLT_Addresses.docx (3 March 2026).
 * Includes legacy USTBL, EUTBL, UKTBL funds plus Amundi Overnight Swap (SAFO) share classes.
 * Per-chain lists are de-duplicated (same contract can appear under more than one product).
 *
 * UKTBL GBP Starknet: the doc lists 0x01953d6e0462… which is not a valid Starknet felt; the
 * deployed register is 0x0153d6e0462080bb2842109e9b64f589ef5aa06bb32b26bbdb894aca92674395.
 */

const rawConfig = {
  ethereum: [
    // USTBL — USD
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
    // USTBL — EUR (unhedged)
    '0x0183ace58bc8B8F1f84CC8b9eD1210E1c87dF7e0',
    // EUTBL — EUR
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80',
    // UKTBL — GBP
    '0xf695Df6c0f3bB45918A7A82e83348FC59517734',
    // UKTBL — EUR (unhedged)
    '0x8513fCDD66E148E4b5E4940be21F50C20D112731',
    // SAFO — EUR / USD / GBP / CHF
    '0x0990b149e915cb08e2143a5c6f669c907eddc8b0',
    '0xcbade7d9bdee88411cb6cbcbb29952b742036992',
    '0xc273986a91e4bfc543610a5cb5860b7cfefb6cc0',
    '0x18b5c15e5196a38a162b1787875295b76e4313fb',
  ],
  polygon: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
    '0x75cB1BD539eE2cb22031603a7b437F1F7077B05e',
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80',
    '0x970E2aDC2fdF53AEa6B5fa73ca6dc30eAFEDfe3D',
    '0x7A16Df1C2Cd8B9EEb9ED9942c82C2e7c90Bb93Db',
    '0x272ea767712cc4839f4a27ee35eb73116158c8a2',
    '0x6f64f47f95cf656f21b40e14798f6b49f80b3dc5',
    '0x4fe515c67eeeadb3282780325f09bb7c244fe774',
    '0x9de2b2dcdcf43540e47143f28484b6d15118f089',
  ],
  arbitrum: [
    '0x021289588cd81dC1AC87ea91e91607eEF68303F5',
    '0xA8De1f55Aa0E381cb456e1DcC9ff781eA0079068',
    '0xCBeb19549054CC0a6257A77736FC78C367216cE7',
    '0x903d5990119bC799423e9C25c56518Ba7DD19474',
    '0x8226E968eFD24d9bAF156Eca15179D1cc1bFD828',
    '0x1412632f2b89e87bfa20c1318a43ced25f1d7b76',
    '0x0c709396739b9cfb72bcea6ac691ce0ddf66479c',
    '0xbe023308ac2ef7e1c3799f4e6a3003ee6d342635',
    '0x97e7962bcd091e7ecfb583fc96289b1e1553ac6e',
  ],
  base: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
    '0xA260D72df8FF2696f3A8d0BE46B7bc4d743Be764',
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80',
    '0xA8De1f55Aa0E381cb456e1DcC9ff781eA0079068',
    '0x0e389C83Bc1d16d86412476F6103027555C03265',
    '0xd879846cbe20751bde8a9342a3cca00a3e56ca47',
    '0x0bb754d8940e283d9ff6855ab5dafbc14165c059',
    '0x2f6c0e5e06b43512706a9cdf66cd21f723fe0ec3',
    '0xd9aa2300e126869182dfb6ecf54984e4c687f36b',
  ],
  starknet: [
    '0x20ff2f6021ada9edbceaf31b96f9f67b746662a6e6b2bc9d30c0d3e290a71f6',
    '0x5442f0c652ee87b2b368960474e873c93982e27c622875d2b1a501de3731714',
    '0x4f5e0de717daa6aa8de63b1bf2e8d7823ec5b21a88461b1519d9dbc956fb7f2',
    // on-chain register (see header); doc had 0x01953d6e… (invalid felt)
    '0x0153d6e0462080bb2842109e9b64f589ef5aa06bb32b26bbdb894aca92674395',
    '0x02ab503476f6b46b15e7d466b77b6e199025ab910090f76822c72074860de0a2',
    '0x0128f41ef8017ab56140ffad6439305a3196ed862841ba61ff4d78e380c346a6',
    '0x035bdc17f7a7d09c45d31ab476a576d4f7aad916676b2948fe172c3bcb33725a',
    '0x06e8a99926ff6d56f4cb93c37b63286d736cd1f81740d53f88b4875b4cbe7f49',
    '0x06723dcb428eddb160c5adfc2d0a5e5adc184bf6a7298780c3cbf3fa764f709b',
  ],
  etlk: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
    '0xA260D72df8FF2696f3A8d0BE46B7bc4d743Be764',
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80',
    '0x970E2aDC2fdF53AEa6B5fa73ca6dc30eAFEDfe3D',
    '0x8226E968eFD24d9bAF156Eca15179D1cc1bFD828',
    '0x35dfec1813c43d82e6b87c682f560bbb8ea0c121',
    '0x5677a4dc7484762ffccee13cba20b5c979def446',
    '0xfe20ebe3881491b2e158b9d10cb95bcfa652262d',
    '0xef53e7d17822b641c6481837238a64a688709301',
  ],
}

const config = {
  ethereum: getUniqueAddresses(rawConfig.ethereum),
  polygon: getUniqueAddresses(rawConfig.polygon),
  arbitrum: getUniqueAddresses(rawConfig.arbitrum),
  base: getUniqueAddresses(rawConfig.base),
  starknet: getUniqueAddresses(rawConfig.starknet, true),
  etlk: getUniqueAddresses(rawConfig.etlk),
  stellar: [
    { contract: 'CARUUX2FZNPH6DGJOEUFSIUQWYHNL5AVDV7PMVSHWL7OBYIBFC76F4TO', target: '0xe4880249745eAc5F1eD9d8F7DF844792D560e750' },
    { contract: 'CCFIYXF32QI45KXO43J7XY3DMH6W6DKT7XFDEHA65UG4ONNPWBWR4YMA', target: '0x0183ace58bc8B8F1f84CC8b9eD1210E1c87dF7e0' },
    { contract: 'CBGV2QFQBBGEQRUKUMCPO3SZOHDDYO6SCP5CH6TW7EALKVHCXTMWDDOF', target: '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80' },
    { contract: 'CDT3KU6TQZNOHKNOHNAFFDQZDURVC3MSTL4ML7TUTZGNOPBZCLABP4FR', target: '0xf695Df6c0f3bB45918A7A82e83348FC59517734' },
    { contract: 'CCPLGWIIZX6GUIV6JUWJBCGW3PB24ZTHKOVGQQNTTAZIJRRLFJ4PIUMZ', target: '0x8513fCDD66E148E4b5E4940be21F50C20D112731' },
    { contract: 'CBOOCGZSVRSZFRE4U2NWR2B4RXYVJWRCBTGOUD2JPI2TDJPWMTJX7FZP', target: '0x0990b149e915cb08e2143a5c6f669c907eddc8b0' },
    { contract: 'CDGSC6BA4TCAOVSFQCUEHDMOIIHYYVNYBT6YEARS4MX3ITAHUINVGQHX', target: '0xcbade7d9bdee88411cb6cbcbb29952b742036992' },
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
  methodology:
    'Sums ERC-20 / Starknet / Stellar totalSupply for all Spiko share-register tokens listed in the prospectus: USTBL, EUTBL, UKTBL, and SAFO (Amundi Overnight Swap) share classes. Priced via DefiLlama.',
}

Object.keys(config).forEach((chain) => {
  const assets = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'stellar') {
        const supplies = await Promise.all(assets.map(({ contract }) => fetchStellarSupply(contract)))
        supplies.forEach((supply, i) => {
          const { target } = assets[i]
          api.add(`ethereum:${target.toLowerCase()}`, supply, { skipChain: true })
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
