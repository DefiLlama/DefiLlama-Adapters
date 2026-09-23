// DefiLlama TVL adapter for Arctide (Arc). Drop-in file for
// https://github.com/DefiLlama/DefiLlama-Adapters -> projects/arctide/index.js
//
// Reads public chain state only. Nothing in Arctide's contracts changes.
//   - Pools: every Arctide pair holds a project token and USDC (the factory's baseToken).
//     The Uniswap-v2 helper enumerates pairs from the factory and prices tokens against USDC.
//   - Launchpad: USDC raised on open bonding curves sits in the launch factory as native balance
//     until graduation, when the contract builds the pool.
//   - Staking: tokens deposited in Hardstake (one pool per token inside one contract).
//   - Hardlock holds LP tokens of the same pools; that liquidity is already inside pool TVL,
//     so it is not added again.
const sdk = require('@defillama/sdk')
const { uniTvlExport, sumUnknownTokens, nullAddress } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')

const chain = 'arc'
const FACTORY = '0x6AFd30Cb35D8B70Cfd84C9AcA92ddc2Dda2879Cb'        // ArctideFactory (allPairs / allPairsLength / baseToken)
const HARDSTAKE = '0x5bd527c326Ab26d2969C40EF83D7Bbd2Ac454588'      // ArctideStaking
const LAUNCH_FACTORY = '0xF7a20a20e18Fa7d4B6c68EE58dA16799382AbCe8' // ArctideLaunchFactory (bonding curves)
const USDC = '0x3600000000000000000000000000000000000000'           // 6-decimal ERC-20 view of Arc's native USDC

const pools = uniTvlExport(chain, FACTORY, { coreAssets: [USDC] })
// Tokens are priced against USDC in their own pool; USDC is the factory's baseToken.

// USDC held by open bonding-curve sales (native balance of the launch factory)
async function launchpad(api) {
  return sumTokens2({ api, owner: LAUNCH_FACTORY, tokens: [nullAddress] })
}

// Pools (Uniswap-v2 helper, tokens priced against USDC in their own pool) + open bonding curves
const tvl = sdk.util.sumChainTvls([pools[chain].tvl, launchpad])

async function staking(api) {
  const pairs = await api.fetchList({
    lengthAbi: 'uint256:allPairsLength',
    itemAbi: 'function allPairs(uint256) view returns (address)',
    target: FACTORY,
  })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pairs })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pairs })
  const tokens = [...new Set([...token0s, ...token1s].map((t) => t.toLowerCase()))].filter((t) => t !== USDC)
  return sumUnknownTokens({ api, owner: HARDSTAKE, tokens, coreAssets: [USDC], lps: pairs })
}

module.exports = {
  misrepresentedTokens: true,
  start: '2026-09-16',
  methodology:
    'TVL is the USDC and project-token reserves of every Arctide pool (tokens priced against USDC in their own pool), plus USDC raised on bonding curves that have not graduated yet. Staking is the value of tokens deposited in the Hardstake contract. Locked LP tokens in Hardlock are not added again because that liquidity is already counted in the pools.',
  [chain]: { tvl, staking },
}
