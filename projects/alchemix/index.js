const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens.js");
const { sumTokensSharedOwners, genericUnwrapCvx } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");
const contracts = require("./contracts");

function tvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const balances = {};
    const transform = await getChainTransform(chain);

    await sumTokensSharedOwners(
      balances,
      Object.values(contracts[chain].underlyingTokens).concat(
        Object.values(contracts[chain].yvTokens)
      ),
      Object.values(contracts[chain].tokenHolders),
      chainBlocks[chain],
      chain,
      transform
    );

    const lpPoolKeys = Object.keys(contracts.cvxLPpools);
    const lpBalances = await Promise.all(
      lpPoolKeys.map(async (lpPoolName) => {
        const { poolAddress, holder, tokenAddress } =
          contracts.cvxLPpools[lpPoolName];
        const lpTokenBalance = await sdk.api.abi.call({
          target: poolAddress,
          abi: "erc20:balanceOf",
          params: holder,
          chain,
          block: chainBlocks[chain],
        });

        return lpTokenBalance.output;
      })
    );

    lpPoolKeys.forEach((lpPoolName, i) => {
      const { tokenAddress  } = contracts.cvxLPpools[lpPoolName];
      sdk.util.sumSingleBalance(
        balances,
        tokenAddress,
        lpBalances[i].toString()
      );
    });

    return balances;
  };
}

module.exports = {
  ethereum: {
    tvl: tvl("ethereum"),
    // staking: staking(
    //   contracts.ethereum.staking.holder,
    //   contracts.ethereum.staking.token
    // ),
  },
  // fantom: {
  //   tvl: tvl("fantom"),
  // },
  // optimism: {
  //   tvl: tvl("optimism"),
  // },
};
