
  const { sumTokensExport } = require('../helper/unwrapLPs');

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const SAI_ADDRESS = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

const tokenAddresses = [
  ETH_ADDRESS,
  WETH_ADDRESS,
  SAI_ADDRESS,
  DAI_ADDRESS,
  USDC_ADDRESS
];

const allOpportunities = [
  {
    address: '0xEa5ee32F3A63c3FaBb311c6E8c985D308A53dcC1', beginTimestamp: 1568057588, endTimestamp: null,
    coins: [SAI_ADDRESS, DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS]
  },
  {
    address: '0xEB6394f817b498c423C44bD72c3D7f8ED5DeeC6e', beginTimestamp: 1568057609, endTimestamp: null,
    coins: [SAI_ADDRESS, DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS], added: [0, 1575650224, 1568341399, 0]

  },
  {
    address: '0x759A728653C4d0483D897DCCf3a343fe2bBbb54A', beginTimestamp: 1570466036, endTimestamp: null,
    coins: [SAI_ADDRESS, DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS]
  },
  {
    address: '0xC830217BD3000E92CE846C549de6a2A36AEa8954', beginTimestamp: 1575649643, endTimestamp: null,
    coins: [DAI_ADDRESS]
  },
  {
    address: '0x3d6fa1331E142504Ba0B7965CD801c7F3b21b6C0', beginTimestamp: 1583869244, endTimestamp: null,
    coins: [DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS]
  }
];

const owners = allOpportunities.map(i => i.address)

const allPortfolioManagers = [
  {
    address: '0x06a5Bf70BfF314177488864Fe03576ff608e6aec', beginTimestamp: 1568274392, endTimestamp: null
  }
];

owners.push(allPortfolioManagers[0].address)

module.exports = {
  start: 1568274392,  // 09/12/2019 @ 7:46am (UTC)
  ethereum: {
    tvl: sumTokensExport({
      owners,
      tokens: tokenAddresses
    })
  }
}
