const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BANK = '0x194726F6C2aE988f1Ab5e1C943c17e591a6f6059'
const IBDP = '0x90679234FE693B39BFdf5642060Cb10571Adc59b'

// BANK lending: a Morpho Blue market lending WFLR against wBANK (fee-free 1:1 wrapper of BANK)
const MORPHO = '0xF4346F5132e810f80a28487a79c7559d9797E8B0'
const MARKET_ID = '0xcbe6d249967c061d6ecb586ec7efeedd66c4a4a7b45c5aa2156452234e0b6677'
const LENDING_START_BLOCK = 72752893

const marketAbi = 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)'

const getMarket = (api) => api.call({ target: MORPHO, abi: marketAbi, params: [MARKET_ID] })

async function tvl(api) {
  await sumTokens2({ api, owners: [BANK, IBDP], tokens: [ADDRESSES.flare.WFLR] })
  if (api.block && api.block < LENDING_START_BLOCK) return

  // wBANK collateral is not added: it is a claim on the WFLR backing already counted above
  const market = await getMarket(api)
  api.add(ADDRESSES.flare.WFLR, BigInt(market.totalSupplyAssets) - BigInt(market.totalBorrowAssets))
}

async function borrowed(api) {
  if (api.block && api.block < LENDING_START_BLOCK) return
  const market = await getMarket(api)
  api.add(ADDRESSES.flare.WFLR, market.totalBorrowAssets)
}

module.exports = {
  methodology: 'TVL is the WFLR backing BANK, held by the BANK and IBDP contracts, plus WFLR supplied and not borrowed in the BANK lending market on Morpho Blue. wBANK collateral is not counted, as it is a claim on the backing already included. Borrowed WFLR is reported separately.',
  flare: {
    tvl,
    borrowed,
  },
}
