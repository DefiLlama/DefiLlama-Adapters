const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { mergeAndSum, sumAutoPoolTokenXY } = require("./utils");
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
  // first value returned in the array is the amount of AP tokens staked by the yield source contract
  const { output: responsesFarmUserInfo } = await sdk.api.abi.multiCall({
    target: aptFarmAddress,
    calls: aptFarmUserInfoCalls,
    chain: api.chain,
    abi: aptFarmABI,
  });

  // then take the amount and pass it to previewAmounts on each respective TJAP Autovault contract, which will give
  // back the amounts redeemable by the yield source in token X and token Y
  const amountsXYCalls = Object.values(addresses.token.tjap).map(
    (autovaultAddress, i) => {
      return {
        target: autovaultAddress,
        params: responsesFarmUserInfo[i].output.amount,
        abi: autoPoolABI,
      };
    }
  );

  const { output: responsesAmountsXY } = await sdk.api.abi.multiCall({
    target: "", // not used, but must be supplied
    calls: amountsXYCalls,
    chain: api.chain,
    abi: autoPoolABI,
  });

  const tjapYieldSourcesTokenSums = responsesAmountsXY.reduce(
    sumAutoPoolTokenXY,
    {}
  );

  vaultsGmx.push(addresses.struct.gmx.yieldSource);

  const vaultTokenSums = await sumTokens2({
    api,
    owners: [vaultsTjap, vaultsGmx].flat(),
    tokens: [
      ADDRESSES.avax.BTC_b,
      ADDRESSES.avax.USDC,
      ADDRESSES.avax.WETH_e,
      ADDRESSES.avax.EURC,
      ADDRESSES.avax.WAVAX,
      addresses.token.gmx.fsGlp,
    ],
  });

  const allTokenSums = mergeAndSum(vaultTokenSums, tjapYieldSourcesTokenSums);

  return allTokenSums;
}

module.exports = {
  avax: {
    tvl,
  },
};
