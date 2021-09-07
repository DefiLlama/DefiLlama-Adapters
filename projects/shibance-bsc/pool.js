const chains = require("./constants/chain");
const sdk = require("@defillama/sdk");
const multiCall = sdk.api.abi.multiCall;
const BigNumber = require("bignumber.js");

const fetchPoolsTotalStaking = async (chain, block) => {
  try {
    const chainId = chains[chain];
    const tokens = require("./constants/" + chain + "/tokens");
    const poolsConfig = require("./constants/" + chain + "/pools");

    function getAddress(addrs) {
      return addrs[chainId];
    }

    const getWbnbAddress = () => {
      return getAddress(tokens.wbnb.address);
    };

    const nonBnbPools = poolsConfig.filter(
      (p) => p.stakingToken.symbol !== "BNB"
    );
    const bnbPool = poolsConfig.filter((p) => p.stakingToken.symbol === "BNB");
    const callsNonBnbPools = nonBnbPools
      .map((poolConfig) => {
        return {
          target: getAddress(poolConfig.stakingToken.address),
          params: getAddress(poolConfig.contractAddress),
        };
      })
      .filter((_) => _.params);

    const callsBnbPools = bnbPool
      .map((poolConfig) => {
        return {
          target: getWbnbAddress(),
          params: getAddress(poolConfig.contractAddress),
        };
      })
      .filter((_) => _.params);

    const nonBnbPoolsTotalStaked = (
      await multiCall({
        chain,
        block,
        calls: callsNonBnbPools,
        abi: "erc20:balanceOf",
      })
    ).output.map((_) => _.output);

    const bnbPoolsTotalStaked = (
      await multiCall({
        chain,
        block,
        calls: callsBnbPools,
        abi: "erc20:balanceOf",
      })
    ).output.map((_) => _.output);

    return [
      ...nonBnbPools.map((p, index) => ({
        sousId: p.sousId,
        totalStaked: new BigNumber(nonBnbPoolsTotalStaked[index]).toJSON(),
      })),
      ...bnbPool.map((p, index) => ({
        sousId: p.sousId,
        totalStaked: new BigNumber(bnbPoolsTotalStaked[index]).toJSON(),
      })),
    ];
  } catch (e) {
    console.log("fetchPoolsTotalStaking", e);
  }
};


module.exports = {
  fetchPoolsTotalStaking,
};