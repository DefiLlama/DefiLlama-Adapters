const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { mergeAndSum, sumTokens } = require("./utils");
const {
  addresses,
  autoPoolABI,
  aptFarmUserInfoCalls,
  aptFarmAddress,
  aptFarmABI
} = require("./constants");
const sdk = require("@defillama/sdk");

async function tvl(ts, _, __, { api }) {
  const vaultsGmx = await api.fetchList({
    lengthAbi: "uint256:totalProducts",
    itemAbi: "function allProducts(uint256) external view returns (address)",
    target: addresses.struct.gmx.factory,
  });
  const vaultsTjap = await api.fetchList({
    lengthAbi: "uint256:totalProducts",
    itemAbi: "function allProducts(uint256) external view returns (address)",
    target: addresses.struct.tjap.factory,
  });

  // call userInfo on APT farm, passing in the farm ID and the yield source address
  // first value returned in the array is the amount of AP tokens owned by the yield source contract
  const { output: responsesFarmUserInfo } = await sdk.api.abi.multiCall({
    target: aptFarmAddress,
    calls: aptFarmUserInfoCalls,
    chain: "avax",
    abi: aptFarmABI,
  });

  // then take the amount and pass it to previewAmounts on each respective TJAP Autovault contract, which will give
  // back the amounts redeemable by the yield source in token X and token Y
  const tokenXYCalls = Object.values(addresses.token.tjap).map(
    (autovaultAddress, i) => {
      return {
        target: autovaultAddress,
        params: responsesFarmUserInfo[i].output.amount,
        abi: autoPoolABI,
      };
    }
  );

  const { output: responsesAmountsXY } = await sdk.api.abi.multiCall({
    target: "", // @note - not used, but must be supplied
    calls: tokenXYCalls,
    chain: "avax",
    abi: autoPoolABI,
  });

  const tjapYieldSourcesTokenSums = responsesAmountsXY.reduce(sumTokens, {});

  vaultsGmx.push(addresses.struct.yieldSource);
  // @todo - figure out why calling this throws an error
  // const gmxSumTokens = sumTokens2({
  //   api,
  //   owners: vaultsGmx,
  //   tokens: [
  //     ADDRESSES.avax.BTC_b,
  //     ADDRESSES.avax.USDC,
  //     ADDRESSES.avax.WETH_e,
  //     addresses.token.gmx.fsGlp,
  //   ],
  // });

  const tjapVaultsTokenSums = sumTokens2({
    api,
    owners: vaultsTjap,
    tokens: [
      ADDRESSES.avax.BTC_b,
      ADDRESSES.avax.USDC,
      ADDRESSES.avax.WETH_e,
      ADDRESSES.avax.EURC,
      ADDRESSES.avax.WAVAX,
    ],
  });

  const tjapTokenSums = mergeAndSum(
    tjapVaultsTokenSums,
    tjapYieldSourcesTokenSums
  );

  return tjapTokenSums;
}

module.exports = {
  avax: {
    tvl,
  },
};
