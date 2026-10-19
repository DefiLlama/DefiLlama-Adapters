const ADDRESSES = require('../helper/coreAssets.json')
const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs')

const USDG = ADDRESSES.robinhood.USDG
const UP = '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1'
const LUTE = '0xD1e861CC5Eee7eA88649206b74504D78CCD7AEeA'

const VE_UP = '0x5d321dE36F0bf98D92b291280514F3878582B7B6'
const VE_LUTE = '0xc1a79e3A7b04c3f21C6409a78Ab58A8C822bE7dC'

const MARKETS = [
  {
    vault: '0xd42174d3Db28B0fA2BD25381c3521b18AE9dB490',
    escrow: '0x79FA72C442ED6beFB1FD5166fe929Ca72E8E9279',
    veNft: VE_UP,
    baseToken: UP,
  },
  {
    vault: '0x747D9aFB9FB5488ccd0886e6A83eB46413010b4c',
    escrow: '0xcD84E5956d2FeE7c4041A2b6fC0212AD60762e06',
    veNft: VE_LUTE,
    baseToken: LUTE,
    isAltAbi: true,
    lockedAbi: 'function getNftState(uint256 tokenId) view returns (tuple(int128 amount,uint256 end,bool isPermanent))',
  },
]

async function addVaultCash(api) {
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: MARKETS.map(({ vault }) => ({ target: USDG, params: vault })),
  })
  balances.forEach(balance => api.add(USDG, balance))
}

async function addCollateral(api) {
  await Promise.all(MARKETS.map(market => unwrapSolidlyVeNft({
    api,
    baseToken: market.baseToken,
    veNft: market.veNft,
    owner: market.escrow,
    isAltAbi: market.isAltAbi,
    lockedAbi: market.lockedAbi,
  })))
}

async function tvl(api) {
  await addVaultCash(api)
  await addCollateral(api)
}

async function borrowed(api) {
  const debts = await api.multiCall({
    abi: 'uint256:totalManagedDebt',
    calls: MARKETS.map(({ vault }) => vault),
  })
  debts.forEach(debt => api.add(USDG, debt))
}

module.exports = {
  timetravel: true,
  start: '2026-09-02',
  methodology: 'TVL is comprised of USDG deposited to the lending vaults and UP/LUTE locked in veNFT collateral escrows. Borrowed USDG is reported separately and not counted towards TVL.',
  robinhood: { tvl, borrowed },
}
