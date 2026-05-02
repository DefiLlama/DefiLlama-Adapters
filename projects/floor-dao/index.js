const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, sumTokensExport, } = require('../helper/unwrapLPs')
// https://docs.floor.xyz/fundamentals/treasury

const WETH = ADDRESSES.ethereum.WETH
const USDC = ADDRESSES.ethereum.USDC

const NFTX_LP_STAKING = '0x688c3e4658b5367da06fd629e41879beab538e37'
const treasury = '0x91E453f442d25523F42063E1695390e325076ca2'
const floorTreasury2 = "0xa9d93a5cca9c98512c8c56547866b1db09090326";
const stakingAddress = '0x759c6de5bca9ade8a1a2719a31553c4b7de02539'
const FLOOR = '0xf59257E961883636290411c11ec5Ae622d19455e'

module.exports.methodology = 'Using ohmTvl for staking and treasury core TVL, and adding xPUNK and xPUNKWETH balances using 1:1 mapping with PUNK and PUNK-WETH sushi LP'

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const vaults = [0, 24, 27, 298, 392,]
      const stakingInfo = await api.multiCall({
        target: NFTX_LP_STAKING,
        abi: abis.vaultStakingInfo,
        calls: vaults.map(i => ({ params: i})),
      })
      const stakingBalances = await api.multiCall({
        target: NFTX_LP_STAKING,
        abi: abis.balanceOf,
        calls: vaults.map(i => ({ params: [i, treasury]})),
      })
      stakingBalances.forEach((bal,i) => api.add(stakingInfo[i][0],bal))
      return sumTokens2({ api, owners: [treasury, floorTreasury2], tokens: [WETH, USDC], resolveLP: true, })
    },
    staking: sumTokensExport({owner: stakingAddress, tokens: [FLOOR]})
  }
}

const abis = {
  vaultStakingInfo: "function vaultStakingInfo(uint256) view returns (address stakingToken, address rewardToken)",
  balanceOf: "function balanceOf(uint256 vaultId, address addr) view returns (uint256)",
}