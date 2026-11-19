const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Tolly launchpad on Arc: each launch mints the full supply into a single-sided Uniswap V3 USDC pool,
// and the LP NFT is sent to the FeeLocker, which has no withdrawal path.
// TVL = USDC side of the Uniswap V3 positions held by the FeeLocker.
// Contracts: https://github.com/TollyLabs/v3-contracts/blob/main/deployment/arc-mainnet-5042.json
const FEE_LOCKER = '0xe20e4297759597da75c8998ee76ec900600ad920'
const UNIV3_NFT_MANAGER = '0x39654a85a4c05127f5fd6ed22caec077a0fb1377'

module.exports = {
  doublecounted: true, // positions sit in Arc Uniswap V3 pools, already counted as dex tvl
  methodology: 'TVL is the USDC in the Uniswap V3 LP positions permanently locked in the Tolly FeeLocker',
  arc: {
    tvl: (api) => sumTokens2({ api, owners: [FEE_LOCKER], resolveUniV3: true, uniV3WhitelistedTokens: [ADDRESSES.arc.USDC], uniV3ExtraConfig: { nftAddress: UNIV3_NFT_MANAGER } }),
  },
}
