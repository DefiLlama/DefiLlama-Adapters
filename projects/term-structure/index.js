const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const ZkTrueUpContractAddress = "0x09E01425780094a9754B2bd8A3298f73ce837CF9";

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const infoAbi = "function getAssetConfig(uint16 tokenId) external view returns (bool isStableCoin, bool isTsbToken, uint8 decimals, uint128 minDepositAmt, address token)"
      const tokenInfo = await api.fetchList({ lengthAbi: 'getTokenNum', itemAbi: infoAbi, target: ZkTrueUpContractAddress, startFrom: 1 })
      const tokens = tokenInfo.map(i => i.token)
      tokens.push(ADDRESSES.ethereum.WETH)
      return sumTokens2({ api, tokens, owner: ZkTrueUpContractAddress })
    },
  },
};
