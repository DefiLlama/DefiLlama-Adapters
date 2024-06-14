const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { sumAutoPoolTokenXY } = require("./utils");
const {
  addresses,
  autoPoolABI,
  aptFarmUserInfoCalls,
  aptFarmAddress,
  aptFarmABI
} = require("./constants");

async function tvl(api) {
  const vaultsGmx = await api.fetchList({ lengthAbi: "totalProducts", itemAbi: "allProducts", target: addresses.struct.gmx.factory, });
  const vaultsTjap = await api.fetchList({ lengthAbi: "totalProducts", itemAbi: "allProducts", target: addresses.struct.tjap.factory, });

  // call userInfo on APT farm, passing in the farm ID and the yield source address
  // first value returned in the array is the amount of AP tokens staked by the yield source contract
  const responsesFarmUserInfo  = await api.multiCall({
    target: aptFarmAddress,
    calls: aptFarmUserInfoCalls,
    abi: aptFarmABI,
  });

  // then take the amount and pass it to previewAmounts on each respective TJAP Autovault contract, which will give
  // back the amounts redeemable by the yield source in token X and token Y
  const amountsXYCalls = Object.values(addresses.token.tjap).map(
    (autovaultAddress, i) => {
      return {
        target: autovaultAddress,
        params: responsesFarmUserInfo[i].amount,
      };
    }
  );

  const responsesAmountsXY  = await api.multiCall({
    calls: amountsXYCalls,
    abi: autoPoolABI,
  })

  responsesAmountsXY.forEach((response, i) => {
    sumAutoPoolTokenXY(api, response, amountsXYCalls[i].target)
  })

  vaultsGmx.push(addresses.struct.gmx.yieldSource);

  return sumTokens2({
    api,
    owners: [vaultsTjap, vaultsGmx].flat(),
    tokens: [
      ADDRESSES.avax.BTC_b,
      ADDRESSES.avax.WBTC_e,
      ADDRESSES.avax.USDC,
      ADDRESSES.avax.WETH_e,
      ADDRESSES.avax.EURC,
      ADDRESSES.avax.WAVAX,
      ADDRESSES.avax.SAVAX,
      addresses.token.gmx.fsGlp,
    ],
  });
}

module.exports = {
  avax: {
    tvl,
  },
};
