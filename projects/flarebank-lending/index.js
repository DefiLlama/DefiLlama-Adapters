const ADDRESSES = require('../helper/coreAssets.json')

// BANK lending: a Morpho Blue market lending WFLR against wBANK (fee-free 1:1 wrapper of BANK)
const MORPHO = '0xF4346F5132e810f80a28487a79c7559d9797E8B0'
const MARKET_ID = '0xcbe6d249967c061d6ecb586ec7efeedd66c4a4a7b45c5aa2156452234e0b6677'

const marketAbi = 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)'

const getMarket = (api) => api.call({ target: MORPHO, abi: marketAbi, params: [MARKET_ID] })

async function tvl(api) {
  // wBANK collateral is not added: it is a claim on the WFLR backing BANK, counted under FlareBank
  const market = await getMarket(api)
  api.add(ADDRESSES.flare.WFLR, BigInt(market.totalSupplyAssets) - BigInt(market.totalBorrowAssets))
}

async function borrowed(api) {
  const market = await getMarket(api)
  api.add(ADDRESSES.flare.WFLR, market.totalBorrowAssets)
}

module.exports = {
  methodology: 'TVL is the WFLR supplied and not borrowed in the BANK lending market on Morpho Blue. wBANK collateral is not counted, as it is a claim on the WFLR backing BANK, which is counted under FlareBank. Borrowed WFLR is reported separately.',
  doublecounted: true,
  start: '2026-10-23',
  flare: {
    tvl,
    borrowed,
  },
}
