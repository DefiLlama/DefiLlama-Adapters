const { ethTvl, getEthereumStaking, getEthereumPoolTvl, getEthereumBorrows, } = require('./config/onx/ethereum');
const { vaults: fVaults } = require('./config/onx/fantom/vaults');
const { vaults: pVaults } = require('./config/onx/polygon/vaults');
const { vaults: aVaults } = require('./config/onx/avalanche/vaults');

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: ethTvl,
    staking: getEthereumStaking,
    pool2: getEthereumPoolTvl,
    borrowed: getEthereumBorrows,
  },
  polygon: { tvl, },
  avax: { tvl, },
  fantom: { tvl, },
};

const config = {
  polygon: { vaults: pVaults },
  avax: { vaults: aVaults },
  fantom: { vaults: fVaults },
}

async function tvl(api) {
  const { vaults } = config[api.chain]
  const pools = vaults.map(i => i[1])
  const tokens = vaults.map(i => i[0])
  const bals = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: pools })
  api.addTokens(tokens, bals)
}