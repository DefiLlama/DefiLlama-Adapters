const ADDRESSES = require('../helper/coreAssets.json')
const WETH = ADDRESSES.ethereum.WETH;
const USDC = ADDRESSES.ethereum.USDC;
const OSQTH = "0xf1B99e3E573A1a9C5E6B2Ce818b617F0E664E86B";

const VAULT_MATH = "0x2b1cb93B8fe1B6fB3810Ab294D681865421C4E37";

async function tvl(api) {
  const fundBalances = await api.call({ abi: 'function getTotalAmounts() view returns (uint256, uint256, uint256)', target: VAULT_MATH })
  api.addTokens([WETH, USDC, OSQTH], fundBalances)
}

module.exports = {
  doublecounted: true,
  methodology:
    "Counts the amount of wETH, USDC & oSQTH in the strategy-controlled pools and treasury",
  ethereum: { tvl, },
};
