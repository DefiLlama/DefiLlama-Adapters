const ADDRESSES = require('../helper/coreAssets.json')

  const { sumTokensExport } = require('../helper/unwrapLPs');

const ETH_ADDRESS = ADDRESSES.null;
const WETH_ADDRESS = ADDRESSES.ethereum.WETH;
const SAI_ADDRESS = ADDRESSES.ethereum.SAI;
const DAI_ADDRESS = ADDRESSES.ethereum.DAI;
const USDC_ADDRESS = ADDRESSES.ethereum.USDC;

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
  start: '2019-09-12',  // 09/12/2019 @ 7:46am (UTC)
  ethereum: {
    tvl: sumTokensExport({
      owners,
      tokens: tokenAddresses
    })
  }
}
