const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, unwrapUniswapLPs } = require('../helper/unwrapLPs')

const TREASURY = '0xF61D218b1429243d7F5937bCB85A4B8b41301CCa'
const HAM = '0xd62DcC1E28D646Db54E2204A40980F9db28e0363'
const WHAM = '0xD48ad2f34Ce9071ac130F55237c030643C5eeDe6'
const RAMSES_WHYPE_WHAM = '0x6cCA1C5a88A391f4e55f69E7BBA13e42A813BaD5'

const WHYPE = ADDRESSES.hyperliquid.WHYPE
const OWN_TOKENS = [HAM, WHAM]

const addProtocolOwnedLiquidity = (api, exclude) =>
  api.call({ target: RAMSES_WHYPE_WHAM, abi: 'erc20:balanceOf', params: [TREASURY] })
    .then((balance) => unwrapUniswapLPs(
      api.getBalances(), [{ balance, token: RAMSES_WHYPE_WHAM }], api.block, api.chain, (a) => a.toLowerCase(), [exclude],
    ))

const tvl = async (api) => {
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens: [WHYPE, ADDRESSES.null],
    blacklistedTokens: OWN_TOKENS,
  })
  await addProtocolOwnedLiquidity(api, WHAM)
}

const ownTokens = async (api) => {
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens: OWN_TOKENS,
  })
  await addProtocolOwnedLiquidity(api, WHYPE)
}

module.exports = {
  start: '2026-06-13',
  methodology:
    'Treasury reserve held by the HAM multisig: WHYPE, native HYPE, and the WHYPE side of protocol-owned Ramses liquidity. HAM and wHAM held by the multisig are protocol inventory, reported under ownTokens rather than TVL so the token is never counted as its own backing. The Cooler desk\'s outstanding loans are not included — treasury adapters carry only tvl and ownTokens.',
  hallmarks: [
    ['2026-06-13', 'Mainnet launch'],
    ['2026-08-10', 'Liquidity migrated to Ramses (wHAM/WHYPE)'],
  ],
  hyperliquid: {
    tvl,
    ownTokens,
  },
}
