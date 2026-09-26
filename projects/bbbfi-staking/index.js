const { getCreateAddress } = require('ethers')
const { unwrapUniswapLPs, sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  xdc: {
    rewardToken: '0x2C0cDA5734dD76c512E05AE0F9397e8a2059c4f4',
    pair: '0x9b272AC6b44fd63225Eb2D5D1183081Ad5f7e7D6',
    staking: ['0x570368acB1e839542062189c73E02CF228523A8E', '0xf496e7addc7f806891B14079D149A8Be3B5E0E43'],
    campaignFactory: '0xFe3C330528a0503B9F7391AFb468BCA9E05dCf1C',
    positionManager: '0xa5007e0501Fc8ecef075f80c44108278342A49d9',
  },
  bsc: {
    rewardToken: '0xE7D366A8064232B7EdEFcEA7Fab853EB5cB9CC83',
    pair: '0x6f31245791151f104d02d9645a0b1da5877C9444',
    staking: ['0xae7ba1fdf2e643f5b4F19689b9904C6a25EEa107', '0xA63893aB679e5Bb12B74D956167972f9B05E4cC4'],
    campaignFactory: '0xbA07ACd648E6B609109D2129b8af75a6F8375982',
    positionManager: '0xf34d5E2d4C53015D4B564B7fD1c1682D9236dd80',
  },
}

const campaignLists = new Map()

async function campaigns(api) {
  await api.getBlock()
  const cached = campaignLists.get(api.chain)
  if (cached?.block === api.block) return cached.promise
  const promise = readCampaigns(api)
  campaignLists.set(api.chain, { block: api.block, promise })
  try {
    return await promise
  } catch (error) {
    if (campaignLists.get(api.chain)?.promise === promise) campaignLists.delete(api.chain)
    throw error
  }
}

async function readCampaigns(api) {
  const { campaignFactory, rewardToken } = config[api.chain]
  const count = await api.call({ target: campaignFactory, abi: 'uint256:campaignCount' })
  // These immutable factories only CREATE campaigns, once per successful
  // campaignCount increment, starting at nonce 1. Verify every derived address
  // against isCampaign; never silently accept a partial list or a failed read.
  const length = Number(count)
  if (!Number.isSafeInteger(length) || length < 0) throw new Error('Invalid BBBFi campaign count')
  const owners = Array.from({ length }, (_, i) => getCreateAddress({ from: campaignFactory, nonce: i + 1 }))
  const verified = await api.multiCall({
    target: campaignFactory, abi: 'function isCampaign(address) view returns (bool)', calls: owners,
  })
  if (verified.length !== length || verified.some(value => value !== true)) throw new Error('Incomplete BBBFi campaign discovery')
  const [pools, protocols] = await Promise.all([
    api.multiCall({ abi: 'address:pool', calls: owners }),
    api.multiCall({ abi: 'uint8:protocol', calls: owners }),
  ])
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: pools }),
    api.multiCall({ abi: 'address:token1', calls: pools }),
  ])
  return owners.map((owner, i) => {
    const protocol = Number(protocols[i])
    if (protocol !== 2 && protocol !== 3) throw new Error('Unsupported BBBFi campaign protocol')
    return {
      owner,
      pool: pools[i],
      protocol,
      pool2: [token0s[i], token1s[i]].some(token => token.toLowerCase() === rewardToken.toLowerCase()),
    }
  })
}

function stakedPrincipal(isPool2) {
  return async api => {
    const { staking, pair, positionManager } = config[api.chain]
    const selected = (await campaigns(api)).filter(campaign => campaign.pool2 === isPool2)
    const v2 = selected.filter(campaign => campaign.protocol === 2).map(campaign => ({
      owner: campaign.owner, pool: campaign.pool, abi: 'uint256:totalWeight',
    }))
    // Easy-stake positions deposit into the same staking/campaign contracts.
    // Count them here once, never again via their per-user entry vaults.
    if (isPool2) v2.push(...staking.map(owner => ({ owner, pool: pair, abi: 'uint256:totalStaked' })))

    const [communityPrincipal, officialPrincipal, balances] = await Promise.all([
      api.multiCall({ abi: 'uint256:totalWeight', calls: v2.filter(row => row.abi === 'uint256:totalWeight').map(row => row.owner) }),
      api.multiCall({ abi: 'uint256:totalStaked', calls: isPool2 ? staking : [] }),
      api.multiCall({ abi: 'erc20:balanceOf', calls: v2.map(({ pool: target, owner: params }) => ({ target, params })) }),
    ])
    const principals = [...communityPrincipal, ...officialPrincipal]
    const positions = v2.map(({ pool: token }, i) => {
      const recorded = BigInt(principals[i])
      const held = BigInt(balances[i])
      // Exclude unsolicited LP transfers and never exceed actual custody.
      return { token, balance: (recorded < held ? recorded : held).toString() }
    })
    await unwrapUniswapLPs(api.getBalances(), positions, api.block, api.chain)

    const owners = selected.filter(campaign => campaign.protocol === 3).map(campaign => campaign.owner)
    if (owners.length) {
      const lengths = await api.multiCall({ abi: 'erc20:balanceOf', target: positionManager, calls: owners })
      const nftCalls = owners.flatMap((owner, i) => Array.from({ length: Number(lengths[i]) }, (_, j) => ({ params: [owner, j] })))
      const ids = await api.multiCall({
        abi: 'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)', target: positionManager, calls: nftCalls,
      })
      const depositors = await api.multiCall({
        abi: 'function depositorOf(uint256) view returns (address)',
        calls: ids.map((params, i) => ({ target: nftCalls[i].params[0], params })),
      })
      // Exclude NFTs sent directly without creating a recorded user stake.
      const positionIds = ids.filter((_, i) => !/^0x0{40}$/i.test(depositors[i]))
      if (positionIds.length) await sumTokens2({
        api, owners, resolveUniV3: true, uniV3ExtraConfig: { nftAddress: positionManager, positionIds },
      })
    }
    // Do not sum rewardToken.balanceOf(staking/campaign): it is a reward budget,
    // not user principal. Ended campaigns remain included until users withdraw.
    return api.getBalances()
  }
}

module.exports = {
  // All these LP/NFT assets are already counted by BBBFi Swap V2 or V3.
  // This is a staking breakdown, not additive fresh liquidity for the parent.
  doublecounted: true,
  methodology: 'Staked LP principal in official fixed/legacy rewards contracts and factory-discovered community campaigns. Protocol-token LPs are pool2; other LPs are tvl. V2 uses recorded stake capped at actual LP custody and unwraps reserves; V3 unwraps currently held position NFTs with recorded depositors. Easy-stake entry vaults are not added again and reward budgets are excluded. Underlying assets overlap BBBFi Swap V2/V3, so this adapter is explicitly doublecounted and must not be added to a deduplicated BBBFi parent total.',
  xdc: { tvl: stakedPrincipal(false), pool2: stakedPrincipal(true) },
  bsc: { tvl: stakedPrincipal(false), pool2: stakedPrincipal(true) },
}
