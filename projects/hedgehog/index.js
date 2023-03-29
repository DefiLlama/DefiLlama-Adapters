const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const OSQTH = "0xf1B99e3E573A1a9C5E6B2Ce818b617F0E664E86B";

const VAULT_MATH = "0x40B22821f694f1F3b226b57B5852d7832e2B5f3f";

async function tvl(timestamp, block, _, { api }) {
  const fundBalances = await api.call({ abi: 'function getTotalAmounts() view returns (uint256, uint256, uint256)', target: VAULT_MATH })
  api.addTokens([WETH, USDC, OSQTH], fundBalances)
}

module.exports = {
  methodology:
    "Counts the amount of wETH, USDC & oSQTH in the strategy-controlled pools and treasury",
  ethereum: { tvl, },
};
