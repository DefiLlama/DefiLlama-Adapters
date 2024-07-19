const { staking } = require('../helper/staking')
const prxy = "0xab3d689c22a2bb821f50a4ff0f21a7980dcb8591";
const btcpx = "0x9C32185b81766a051E08dE671207b34466DD1021";

async function tvl(api) {
  const bal = await api.call({ abi: 'erc20:totalSupply', target: btcpx })
  api.add(btcpx, bal)
}

module.exports = {
  polygon: { tvl, staking: staking('0x015CEe3aB6d03267B1B2c05D2Ac9e2250AF5268d', prxy), },
  ethereum: { tvl, },
  methodology: `BTC Proxy offers a unique institutional-grade wrapped Bitcoin solution that leverages Polygon technology to bring Bitcoin to DeFi 2.0 with no gas and no slippage and insured custody. BTC Proxy features (3,3) Staking and Bonding via the PRXY Governance token`,
};
