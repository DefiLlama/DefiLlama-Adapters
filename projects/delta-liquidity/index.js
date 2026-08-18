const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

// Delta v3 (live stack)
const VAULT_FACTORY = '0x68EDc4948F60D21c4a7Dcbb8Ed4500cE6D0b153c'
const LADDER_MANAGER = '0x64680254BF644BBdDe394b95129895c13317FeD4'
const ROUTER_V3 = '0x46dFEa430d1F069C129E26445319562e29f39C47'

// Delta v2 (legacy stack, still active)
const ROUTER_V2 = '0x75A361513Ccad1b1E9AAe33458764Df06001DC43'
const FARM_FACTORY_V2 = '0xc6F0E707574Fce5Da8B125edD9529DbAF985e62A'

// Chain infra
const NPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3' // UniswapV3 NonfungiblePositionManager
const WETH = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
const DELTA = '0xe8ffd7e24187F72afB08d75B1bb13088A989a791'

async function tvl(api) {
  // Delta vaults (each vault custodies one Uniswap v3 position NFT)
  const vaults = await api.fetchList({
    lengthAbi: 'uint256:vaultCount',
    itemAbi: 'function allVaults(uint256) view returns (address)',
    target: VAULT_FACTORY,
  })

  // Legacy v2 farms custody Uniswap v2 LP tokens
  const farmsV2 = await api.fetchList({
    lengthAbi: 'uint256:farmCount',
    itemAbi: 'function allFarms(uint256) view returns (address)',
    target: FARM_FACTORY_V2,
  })
  const lpTokens = farmsV2.length
    ? await api.multiCall({ abi: 'address:stakingToken', calls: farmsV2 })
    : []

  const owners = [LADDER_MANAGER, ROUTER_V3, ROUTER_V2, ...vaults, ...farmsV2]

  return sumTokens2({
    api,
    owners,
    tokens: [nullAddress, WETH, DELTA, ...lpTokens],
    resolveUniV3: true,
    resolveLP: true,
    uniV3ExtraConfig: { nftAddress: NPM },
  })
}

module.exports = {
  methodology:
    'TVL counts assets custodied by Delta contracts on Robinhood Chain: Uniswap v3 position NFTs held by Delta vaults and by the ladder manager (unwrapped to underlying token amounts via the position manager), liquidity-depth budgets (WETH and paired tokens) held by the liquidity routers, and Uniswap v2 LP tokens staked in legacy Delta farms (unwrapped to underlying reserves). Vault share tokens and farm receipt tokens are excluded to avoid double counting. User-custodied ladder positions (where the user retains the NFT) are not counted.',
  doublecounted: true, // liquidity sits inside Uniswap pools, which DefiLlama counts under Uniswap
  robinhood: { tvl },
}
