const sdk = require("@defillama/sdk");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");

const abi = {
  "poolLength": "uint256:poolLength",
  "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accSushiPerShare, bool isVault)"
}

async function tvl(api) {
  const balances = {}
  const pools = (await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: chefArbitrum })).map(i => i.lpToken)
  const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: pools })
  const vaults = pools.filter((_, i) => /_ZLP$/.test(symbols[i]))
  const underlying = await api.multiCall({ abi: 'address:UNDERLYING', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalHoldings', calls: vaults })
  bals.forEach((v, i) => sdk.util.sumSingleBalance(balances,underlying[i],v, api.chain))
  await unwrapLPsAuto({ api, balances})
  return balances
}

const chefArbitrum = "0x2F9805038114B9DDcf99316a5b4Db2eC820322D3";

module.exports = {
  methodology: `Total value in MasterChef`,
  misrepresentedTokens: true,
  arbitrum: {
    tvl,
  },
}
