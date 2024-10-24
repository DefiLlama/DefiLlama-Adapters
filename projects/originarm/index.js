const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const originLidoArm = "0x85b78aca6deae198fbf201c82daf6ca21942acc6";
      const [weth, steth, outstandingSteth] = await Promise.all([
        api.call({abi: 'erc20:balanceOf', target: originLidoArm, params: ADDRESSES.ethereum.WETH }),
        api.call({abi: 'erc20:balanceOf', target: originLidoArm, params: ADDRESSES.ethereum.STETH }),
        api.call({abi: 'uint256:lidoWithdrawalQueueAmount', target: originLidoArm }),
      ])
      api.add(ADDRESSES.ethereum.WETH, weth)
      api.add(ADDRESSES.ethereum.STETH, steth + outstandingSteth)
      return api.sumTokens({ owner: originLidoArm, tokens: [ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.STETH] })
    },
  },
};
