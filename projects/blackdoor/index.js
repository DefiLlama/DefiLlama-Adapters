const ADDRESSES = require('../helper/coreAssets.json');
const target = "0x4FaCa0EA8Dd4fE6E703f001435A99263336a498E";

async function tvl(api) {
  const markets = await api.fetchList({ lengthAbi: "uint256:totalMarkets", itemAbi: "function markets(uint256) view returns (address)", target, });

  await api.sumTokens({owners: markets, tokens: [ADDRESSES.arbitrum.USDC_CIRCLE]});
}

module.exports = {
  arbitrum: { tvl },
  methodology: "Sum of USDC held in each BlackDoor PredictionMarket contract on Arbitrum One.",
};
