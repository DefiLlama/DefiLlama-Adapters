const sdk = require("@defillama/sdk");
const Helper = require("./Helper.js");
const ethers = require("ethers");

async function tvlBSC(_, _1, _2, { api }, block) {
  var balances = {};
  var collateralBalance;

  for (stratAddr in Helper.Strategies) {
    collateralBalance = await api.call({
      abi: Helper.abi.getVaultValues,
      target: Helper.Strategies[stratAddr],
      block: block,
    });
    sdk.util.sumSingleBalance(
      balances,
      "tether",
      Number(ethers.utils.formatEther(collateralBalance))
    );
  }

  for (PublicVaultAddr in Helper.PublicVault) {
    collateralBalance = await api.call({
      abi: Helper.abi.getVaultValues,
      target: Helper.PublicVault[PublicVaultAddr],
      block: block,
    });
    sdk.util.sumSingleBalance(
      balances,
      "tether",
      Number(ethers.utils.formatEther(collateralBalance))
    );
  }

  for (PrivateVaultAddr in Helper.PrivateVault) {
    collateralBalance = await api.call({
      abi: Helper.abi.getVaultValues,
      target: Helper.PrivateVault[PrivateVaultAddr],
      block: block,
    });
    sdk.util.sumSingleBalance(
      balances,
      "tether",
      Number(ethers.utils.formatEther(collateralBalance))
    );
  }

  //Calculate the Liqudity Pool TVL
  var poolLength = await api.call({
    abi: Helper.abi.poolLength,
    target: Helper.farms.MasterChefAddress,
    block: block,
  });

  for (let i = 0; i < poolLength; i++) {
    var poolInfoMaster = await api.call({
      abi: Helper.abi.poolInfoMaster,
      params: [i],
      target: Helper.farms.MasterChefAddress,
      block: block,
    });
    if (poolInfoMaster[0] != Helper.farms.LockStakingAddress) {
      var amount = await api.call({
        abi: Helper.abi.balance,
        params: [Helper.farms.MasterChefAddress],
        target: poolInfoMaster[0],
        block: block,
      });
      var decimals = await api.call({
        abi: Helper.abi.decimals,
        target: poolInfoMaster[0],
        block: block,
      });
      var price = await api.call({
        abi: Helper.abi.getPrice,
        params: [poolInfoMaster[0], Helper.token.USDT],
        target: Helper.farms.PriceMasterAddr,
        block: block,
      });
      var LPamount =
        Number(ethers.utils.formatUnits(price, decimals)) *
        Number(ethers.utils.formatEther(amount));
      sdk.util.sumSingleBalance(balances, "tether", LPamount);
    }
  }

  return balances;
}

module.exports = {
  bsc: {
    tvl: tvlBSC,
  },
};
