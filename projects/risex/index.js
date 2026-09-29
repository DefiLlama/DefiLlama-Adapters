const { sumTokens2 } = require('../helper/unwrapLPs')

const CollateralManager = '0x2C03C7d7e2974C6599b6B108879109281ef3F818'

async function tvl(api) {
  const tokens = await api.call({
    target: CollateralManager,
    abi: 'address[]:getSupportedCollateralTokens',
  })
  return sumTokens2({ api, owner: CollateralManager, tokens })
}

module.exports = {
  rise: { tvl },
  methodology:
    'TVL is the sum of ERC20 balances of all supported collateral tokens (read dynamically from CollateralManager.getSupportedCollateralTokens) held by the RISEx CollateralManager contract on RISE Chain. RISE-USDC is bridged from Ethereum via LayerZero and remapped to Ethereum USDC for pricing (registered in projects/helper/tokenMapping.js) until RISE is indexed by coins.llama.fi.',
}
