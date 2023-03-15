
const abi = require("../benddao/helper/abis");
const address = require("../benddao/helper/address")
const sdk = require('@defillama/sdk')

module.exports = {
  ethereum: {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}

      const addressMap = address[api.chain];
      const bnftAssetList = await api.call({
        target: addressMap.BNFTRegistry,
        abi: abi.BNFTRegistry.getBNFTAssetList,
      })

      const bnftProxyList = await api.multiCall({
        calls: bnftAssetList,
        target: addressMap.BNFTRegistry,
        abi: abi.BNFTRegistry.bNftProxys,
      });
      const apeStakingStakedTotal = await api.multiCall({
        calls: bnftProxyList,
        target: addressMap.ApeCoinStaking,
        abi: abi.ApeCoinStaking.stakedTotal,
      })

      apeStakingStakedTotal.forEach((d) =>
        sdk.util.sumSingleBalance(balances, addressMap.ApeCoin, d, api.chain)
      );

      return balances
    }
  }
}