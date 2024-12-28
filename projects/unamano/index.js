const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const abis = {
  poolInfo: "function poolInfo(uint256) view returns (address candyToken, uint256 startBlock, uint256 endBlock, uint256 lastRewardBlock, uint256 accPerShare, uint256 candyPerBlock, uint256 lpSupply, uint256 candyBalance, uint256 le12, tuple(address creator, uint256 unlockTime, uint256 maximumStaking, uint8 status, address multisignatureWallet, address assetManagementAddr) una)",
  poolLength: "uint256:poolLength",
}

module.exports = {
  ethereum:{
    tvl: async (api) => {
      const info = await api.fetchList({  lengthAbi: abis.poolLength, itemAbi: abis.poolInfo, target: '0x078aadff42c94b01f135b0ab1d4b794902c67c3f'})
      return sumTokens2({ api, tokens: [ADDRESSES.ethereum.STETH], owners: info.map(i => i.una.assetManagementAddr)})
    },
  },
}
