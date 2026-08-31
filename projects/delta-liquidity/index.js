const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

// Delta v3 (live stack)
const VAULT_FACTORY = '0x68EDc4948F60D21c4a7Dcbb8Ed4500cE6D0b153c'
const LADDER_MANAGER = '0x64680254BF644BBdDe394b95129895c13317FeD4'
const LADDER_MANAGER_V2 = '0xC5941433114BB47a9733CB31a0A3A3dBfF45B418'
const LADDER_MANAGERS = [LADDER_MANAGER, LADDER_MANAGER_V2]
const ROUTER_V3 = '0x46dFEa430d1F069C129E26445319562e29f39C47'

// Delta v2 (legacy stack, still active)
const ROUTER_V2 = '0x75A361513Ccad1b1E9AAe33458764Df06001DC43'
const FARM_FACTORY_V2 = '0xc6F0E707574Fce5Da8B125edD9529DbAF985e62A'

// Chain infra
const NPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3' // UniswapV3 NonfungiblePositionManager
const V4_POSM = '0x58daec3116aae6D93017bAAea7749052E8a04fA7' // UniswapV4 PositionManager
const V4_STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const DELTA = '0xe8ffd7e24187F72afB08d75B1bb13088A989a791'
const LADDER_DEPLOY_BLOCK = 29958000

async function getOwnersAndTokens(api) {
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

    const lpTokens = farmsV2.length ? await api.multiCall({ abi: 'address:stakingToken', calls: farmsV2 }) : []
    const owners = [...LADDER_MANAGERS, ROUTER_V3, ROUTER_V2, ...vaults, ...farmsV2]

    // Uniswap v4 positions managed by the ladder managers.
    // No v4 subgraph on this chain, so position ids are enumerated from each
    // manager's own events, then filtered to those the manager still holds.
    let candidateIds = []
    for (const target of LADDER_MANAGERS) {
        const opened = await getLogs2({
            api,
            target,
            eventAbi: 'event ManagedOpenV4(address indexed owner, bytes32 indexed poolId, uint256[] tokenIds)',
            fromBlock: LADDER_DEPLOY_BLOCK,
            extraKey: 'managed-open-v4',
        })
        candidateIds.push(...opened.flatMap(i => i.tokenIds.map(j => j.toString())))
    }
    candidateIds = [...new Set(candidateIds)]

    const positionOwners = await api.multiCall({
        abi: 'function ownerOf(uint256) view returns (address)',
        calls: candidateIds.map(i => ({ target: V4_POSM, params: [i] })),
        permitFailure: true, // closed positions are burned and revert
    })
    const managerSet = new Set(LADDER_MANAGERS.map(i => i.toLowerCase()))
    const positionIds = candidateIds.filter((_, i) => positionOwners[i] && managerSet.has(positionOwners[i].toLowerCase()))

    return { owners, lpTokens, positionIds }
}

async function tvl(api) {
  const { owners, lpTokens, positionIds } = await getOwnersAndTokens(api)

  // Uniswap v3 positions + ERC20/native balances + legacy LP
  await sumTokens2({
    api,
    owners,
    tokens: [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG, ADDRESSES.robinhood.USDe, ...lpTokens],
    resolveUniV3: true,
    resolveLP: true,
    blacklistedTokens: [DELTA],
    uniV3ExtraConfig: { nftAddress: NPM },
  })

  // v4 positions
  if (positionIds.length)
    await sumTokens2({
      api,
      blacklistedTokens: [DELTA],
      resolveUniV4: true,
      uniV4ExtraConfig: { nftAddress: V4_POSM, stateViewer: V4_STATE_VIEW, positionIds },
    })
}

async function staking(api) {
  const { owners, positionIds } = await getOwnersAndTokens(api)

  // Direct DELTA balances + the DELTA side of v3 positions
  await sumTokens2({
    api,
    owners,
    tokens: [DELTA],
    resolveUniV3: true,
    uniV3WhitelistedTokens: [DELTA],
    uniV3ExtraConfig: { nftAddress: NPM },
  })

  // DELTA side of v4 positions
  if (positionIds.length)
    await sumTokens2({
      api,
      resolveUniV4: true,
      uniV3WhitelistedTokens: [DELTA],
      uniV4ExtraConfig: { nftAddress: V4_POSM, stateViewer: V4_STATE_VIEW, positionIds },
    })
}

module.exports = {
  methodology:
    'TVL counts assets custodied by Delta contracts on Robinhood Chain: Uniswap v3 and v4 position NFTs held by Delta vaults and the ladder managers (unwrapped to underlying token amounts; v4 positions enumerated from the managers\' open events since the chain has no v4 subgraph, then filtered to those still custodied), liquidity-depth budgets (WETH and paired tokens) held by the liquidity routers, and Uniswap v2 LP tokens staked in legacy Delta farms (unwrapped to underlying reserves). Vault share tokens and farm receipt tokens are excluded to avoid double counting. User-custodied positions are not counted.',
  doublecounted: true, // liquidity sits inside Uniswap pools, which DefiLlama counts under Uniswap
  robinhood: { tvl, staking },
}
