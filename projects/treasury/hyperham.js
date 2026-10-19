const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, unwrapUniswapLPs } = require('../helper/unwrapLPs')

const TREASURY = '0xF61D218b1429243d7F5937bCB85A4B8b41301CCa'
const HAM = '0xd62DcC1E28D646Db54E2204A40980F9db28e0363'
const WHAM = '0xD48ad2f34Ce9071ac130F55237c030643C5eeDe6'
const RAMSES_WHYPE_WHAM = '0x6cCA1C5a88A391f4e55f69E7BBA13e42A813BaD5'

const WHYPE = ADDRESSES.hyperliquid.WHYPE
const OWN_TOKENS = [HAM, WHAM]
const BOND_DESKS = [
  { address: '0xA7FF7341A3A2A545293249D00959960A6Db6dcb2', fromBlock: 43099915 },
  { address: '0x195c6F5bb073E70b0889674b4Ef1F4164dbdd004', fromBlock: 46354528 },
]

const addProtocolOwnedLiquidity = (api, exclude) =>
  api.call({ target: RAMSES_WHYPE_WHAM, abi: 'erc20:balanceOf', params: [TREASURY] })
    .then((balance) => unwrapUniswapLPs(
      api.getBalances(), [{ balance, token: RAMSES_WHYPE_WHAM }], api.block, api.chain, (a) => `${api.chain}:${a.toLowerCase()}`, [exclude],
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
  const block = await api.getBlock()
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens: OWN_TOKENS,
  })
  await addProtocolOwnedLiquidity(api, WHYPE)
  const desks = BOND_DESKS.filter(({ fromBlock }) => block >= fromBlock).map(({ address }) => address)
  const [balances, owed] = await Promise.all([
    api.multiCall({ target: WHAM, abi: 'erc20:balanceOf', calls: desks }),
    api.multiCall({ abi: 'uint256:totalOwedShares', calls: desks }),
  ])
  // Sold but unclaimed wHAM belongs to bonders, not the treasury. Only free
  // inventory remains protocol-owned, including inventory at retired desks.
  balances.forEach((balance, i) => {
    const free = BigInt(balance) - BigInt(owed[i])
    if (free > 0n) api.add(WHAM.toLowerCase(), free.toString())
  })
}

module.exports = {
  start: '2026-06-13',
  methodology:
    'Treasury reserve held by the HAM multisig: WHYPE, native HYPE, and the WHYPE side of protocol-owned Ramses liquidity. HAM and wHAM held by the multisig, its LP wHAM share, and unsold wHAM inventory in the bond desks are reported under ownTokens rather than TVL. Bond-desk inventory excludes totalOwedShares, which belongs to bonders. The Cooler desk\'s outstanding loans are not included — treasury adapters carry only tvl and ownTokens.',
  hallmarks: [
    ['2026-06-13', 'Mainnet launch'],
    ['2026-08-10', 'Liquidity migrated to Ramses (wHAM/WHYPE)'],
  ],
  hyperliquid: {
    tvl,
    ownTokens,
  },
}
