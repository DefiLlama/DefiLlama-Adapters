const { sumTokens2, sumTokensExport, } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");
// https://docs.floor.xyz/fundamentals/treasury

const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const NFTX_LP_STAKING = '0x688c3e4658b5367da06fd629e41879beab538e37'
const treasury = '0x91E453f442d25523F42063E1695390e325076ca2'
const stakingAddress = '0x759c6de5bca9ade8a1a2719a31553c4b7de02539'
const FLOOR = '0xf59257E961883636290411c11ec5Ae622d19455e'

module.exports.methodology = 'Using ohmTvl for staking and treasury core TVL, and adding xPUNK and xPUNKWETH balances using 1:1 mapping with PUNK and PUNK-WETH sushi LP'

module.exports = {
  ethereum: {
    tvl: async (_, block) => {
      const vaults = [0, 24, 27, 298, 392,]
      const stakingInfo = await sdk.api2.abi.multiCall({
        target: NFTX_LP_STAKING,
        abi: abis.vaultStakingInfo,
        calls: vaults.map(i => ({ params: i})),
        block,
      })
      const stakingBalances = await sdk.api2.abi.multiCall({
        target: NFTX_LP_STAKING,
        abi: abis.balanceOf,
        calls: vaults.map(i => ({ params: [i, treasury]})),
        block,
      })
      const balances = {}
      stakingBalances.forEach((bal,i) => sdk.util.sumSingleBalance(balances,stakingInfo[i][0],bal))
      return sumTokens2({ balances, block, owner: treasury, tokens: [WETH], resolveLP: true, })
    },
    staking: sumTokensExport({owner: stakingAddress, tokens: [FLOOR]})
  }
}

const abis = {
  vaultStakingInfo: {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"vaultStakingInfo","outputs":[{"internalType":"address","name":"stakingToken","type":"address"},{"internalType":"address","name":"rewardToken","type":"address"}],"stateMutability":"view","type":"function"},
  balanceOf: {"inputs":[{"internalType":"uint256","name":"vaultId","type":"uint256"},{"internalType":"address","name":"addr","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
}