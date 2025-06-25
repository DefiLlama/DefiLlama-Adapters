const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const originLidoArm = "0x85b78aca6deae198fbf201c82daf6ca21942acc6";
      const outstandingSteth = await api.call({abi: 'uint256:lidoWithdrawalQueueAmount', target: originLidoArm })
      api.add(ADDRESSES.ethereum.STETH, outstandingSteth)
      return api.sumTokens({ owner: originLidoArm, tokens: [ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.STETH] })
    },
  },
};
