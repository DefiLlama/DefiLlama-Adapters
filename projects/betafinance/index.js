const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getConfig } = require('../helper/cache')
const { sumTokens } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    bank: '0x972a785b390D05123497169a04c72dE652493BE1',
    collaterals: [
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.WETH,
    ],
    poolURL: 'https://beta-reward-xvn33y7hlq-uc.a.run.app/beta_active_eth/reward_infos'
  },
  avax: {
    bank: '0xf3a82ddd4fbf49a35eccf264997f82d40510f36b',
    collaterals: [
      ADDRESSES.avax.USDT_e,
      ADDRESSES.avax.USDC_e,
      ADDRESSES.avax.DAI,
      ADDRESSES.avax.WETH_e,
      ADDRESSES.avax.WAVAX,
    ],
    poolURL: 'https://beta-reward-xvn33y7hlq-uc.a.run.app/beta_active_avax/reward_infos'
  }
}

const underlyingABI = "address:underlying"

async function getPools(chain) {
  const url = config[chain].poolURL
  return (await getConfig('beta-finance/'+chain, url)).pool_infos
    .filter(i => i.kind === 'BetaLendHandler')
    .map(i => i.address)
}

function setChainTVL(chain) {
  module.exports[chain] = {
    tvl: async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      const pools = await getPools(chain)
      const { bank, collaterals } = config[chain]
      const calls = pools.map(i => ({ target: i }))
      const underlyings = await sdk.api.abi.multiCall({ abi: underlyingABI, calls, block, chain })
      const toa = underlyings.output.map(({ output, input: { target }}) => [output, target])
      collaterals.forEach(token => toa.push([token, bank]))
      return sumTokens({}, toa, block, chain)
    }
  }
}

module.exports = {
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
};

Object.keys(config).forEach(setChainTVL)