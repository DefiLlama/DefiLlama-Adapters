const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BANK = '0x194726F6C2aE988f1Ab5e1C943c17e591a6f6059'
const IBDP = '0x90679234FE693B39BFdf5642060Cb10571Adc59b'

// BANK lending: a Morpho Blue market lending WFLR against wBANK (fee-free 1:1 wrapper of BANK)
const MORPHO = '0xF4346F5132e810f80a28487a79c7559d9797E8B0'
const MARKET_ID = '0xcbe6d249967c061d6ecb586ec7efeedd66c4a4a7b45c5aa2156452234e0b6677'
const WBANK = '0x9f1a66A34a8b2768DdDEb49dA99e6161d0D2DD87'
const LENDING_START_BLOCK = 72752893

const marketAbi = 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)'

const getMarket = (api) => api.call({ target: MORPHO, abi: marketAbi, params: [MARKET_ID] })

async function tvl(api) {
  await sumTokens2({ api, owners: [BANK, IBDP], tokens: [ADDRESSES.flare.WFLR] })
  if (api.block && api.block < LENDING_START_BLOCK) return

  const [market, collateral, wflrPerBank] = await Promise.all([
    getMarket(api),
    // wBANK is only used as collateral in this market, so morpho's balance is the market's collateral
    api.call({ target: WBANK, abi: 'erc20:balanceOf', params: [MORPHO] }),
    // BANK has no market price; value it at its redemption price, the same source the market's oracle reads
    api.call({ target: BANK, abi: 'function calculateEthereumReceived(uint256) view returns (uint256)', params: [String(1e18)] }),
  ])
  api.add(ADDRESSES.flare.WFLR, BigInt(market.totalSupplyAssets) - BigInt(market.totalBorrowAssets))
  api.add(ADDRESSES.flare.WFLR, BigInt(collateral) * BigInt(wflrPerBank) / 10n ** 18n)
}

async function borrowed(api) {
  if (api.block && api.block < LENDING_START_BLOCK) return
  const market = await getMarket(api)
  api.add(ADDRESSES.flare.WFLR, market.totalBorrowAssets)
}

module.exports = {
  methodology: 'TVL is the WFLR backing BANK, held by the BANK and IBDP contracts, plus the BANK lending market on Morpho Blue: WFLR supplied and not borrowed, and wBANK collateral valued at BANK\'s on-chain redemption price in WFLR. Borrowed WFLR is reported separately.',
  flare: {
    tvl,
    borrowed,
  },
}
