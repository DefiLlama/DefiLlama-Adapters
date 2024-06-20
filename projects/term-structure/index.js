const ADDRESSES = require('../helper/coreAssets.json')

const ZkTrueUpContractAddress = "0x09E01425780094a9754B2bd8A3298f73ce837CF9";
const EthTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const tokenNums = await api.call({
        target: ZkTrueUpContractAddress,
        abi: "function getTokenNum() external view returns (uint16)",
      });

      const assetConfigs = await api.multiCall({
        target: ZkTrueUpContractAddress,
        abi: "function getAssetConfig(uint16 tokenId) external view returns (bool isStableCoin, bool isTsbToken, uint8 decimals, uint128 minDepositAmt, address token)",
        calls: new Array(Number(tokenNums)).fill(0).map((_, i) => ({
          params: [i+1],
        }))
      })

      const tokens = assetConfigs.map(assetConfig => {
        const isETH2WETH = assetConfig.token ===  EthTokenAddress;
        return isETH2WETH ? ADDRESSES.ethereum.WETH : assetConfig.token;
      });

      return await api.sumTokens({
        owners: [
          ZkTrueUpContractAddress,
        ],
        tokens: tokens,
      });
    },
  },
};
