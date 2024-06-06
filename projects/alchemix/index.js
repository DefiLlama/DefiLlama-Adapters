const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");
const contracts = require("./contracts");

function tvl(chain) {
  return async (api) => {
    const tokens = Object.values(contracts[chain].underlyingTokens).concat(Object.values(contracts[chain].yvTokens))
    await sumTokens2({ tokens, api, owners: Object.values(contracts[chain].tokenHolders) })
    if (api.chain !== 'ethereum') return api.getBalances()

    await Promise.all(
      Object.values(contracts.cvxLPpools).map(async ({ poolAddress, holder, tokenAddress, alToken }) => {
        const lpTokenBalance = await api.call({ target: poolAddress, abi: "erc20:balanceOf", params: holder, })
        const supply = await api.call({ target: tokenAddress, abi: "erc20:totalSupply", })
        // console.log({poolAddress, holder, tokenAddress, alToken, lpTokenBalance, supply, ratio: lpTokenBalance / supply})
        if (+supply === 0) return;
        const ratio = lpTokenBalance / supply
        const tokenBalances = await api.multiCall({ target: tokenAddress, abi: 'function balances(uint256) view returns (uint256)', calls: [0, 1] })
        const tokens = await api.multiCall({ target: tokenAddress, abi: 'function coins(uint256) view returns (address)', calls: [0, 1] })
        alToken = alToken.toLowerCase()
        tokens.forEach((token, i) => {
          if (token.toLowerCase() !== alToken) {
            if (!isNaN(tokenBalances[i] * ratio))api.add(token, tokenBalances[i] * ratio)
          }
        })
      })
    );
  };
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: tvl("ethereum"),
    staking: staking(
      contracts.ethereum.staking.holder,
      contracts.ethereum.staking.token
    ),
  },
  fantom: {
    tvl: tvl("fantom"),
  },
  optimism: {
    tvl: tvl("optimism"),
  },
};
