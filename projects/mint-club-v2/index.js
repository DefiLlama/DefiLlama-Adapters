const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "Calculates the total collateral value of all the Mint.club V2 Bonding Curve protocols and staking pools.",
};

const chains = ['avax', 'ethereum', 'optimism', 'arbitrum', 'polygon', 'bsc', 'base', 'blast', 'degen', 'zora', 'klaytn', 'shibarium', 'unichain']

const V2_BOND_CONTRACTS = {
  avax: "0x3Fd5B4DcDa968C8e22898523f5343177F94ccfd1",
  blast: "0x621c335b4BD8f2165E120DC70d3AfcAfc6628681",
  degen: "0x3bc6B601196752497a68B2625DB4f2205C3b150b",
  zora: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  klaytn: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  shibarium: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
  unichain: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27"
}

const STAKE_CONTRACTS = {
  ethereum: ['0x841A2bD2fc97DCB865b4Ddb352540148Bad2dB09'],
  optimism: ['0xF187645D1C5AE70C3ddCDeE6D746E5A7619a2A65'],
  arbitrum: ['0xf7e2cDe9E603F15118E6E389cF14f11f19C1afbc'],
  avax: ['0x68f54a53d3E69e2191bCF586fB507c81E5353413'],
  polygon: [
    // v1.1 contract
    '0xF187645D1C5AE70C3ddCDeE6D746E5A7619a2A65',
    // v1.2 contract
    '0x95BDA90196c4e737933360F4639c46Ace657AAb7'],
  bsc: [
    // v1.1 contract
    '0x841A2bD2fc97DCB865b4Ddb352540148Bad2dB09',
    // v1.2 contract
    '0x7B09b728ee8c6a714dC3F10367b5DF9b217FE633'],
  base: [
    // v1 contract
    '0x364e0f814a2c5524d26e82937815c574f8bB86C1', 
    // v1.1 contract
    '0x3460E2fD6cBC9aFB49BF970659AfDE2909cf3399',
    // v1.2 contract
    '0x9Ab05EcA10d087f23a1B22A44A714cdbBA76E802'
  ],
  blast: ['0x68f54a53d3E69e2191bCF586fB507c81E5353413'],
  degen: ['0x5FBdC7941a735685eB08c51776bA77098ebe1eb7'],
  zora: ['0x3Fd5B4DcDa968C8e22898523f5343177F94ccfd1'],
  klaytn: ['0x29b0E6D2C2884aEa3FB4CB5dD1C7002A8E10c724'],
  cyber: ['0x3Fd5B4DcDa968C8e22898523f5343177F94ccfd1'],
  apeChain: ['0xa4021a8907197Df92341F1218B32E26b250F6798'],
  shibarium: ['0xa4021a8907197Df92341F1218B32E26b250F6798'],
  hashkey: ['0xa4021a8907197Df92341F1218B32E26b250F6798'],
  unichain: ['0xa4021a8907197Df92341F1218B32E26b250F6798'],
  over: ['0x621c335b4BD8f2165E120DC70d3AfcAfc6628681'],
}

const ownTokens = {
  bsc: ['0x1f3Af095CDa17d63cad238358837321e95FC5915']
}

async function getStakingTvl(api, stakingContracts) {
  for (const stakingContract of stakingContracts) {
    const poolCount = await api.call({
      target: stakingContract,
      abi: 'function poolCount() view returns (uint256)'
    })

    const stakingTokensSet = new Set()

    const ids = Array.from({ length: Number(poolCount) }, (_, k) => k)
    const pools = await api.multiCall({
      target: stakingContract,
      abi: 'function pools(uint256) view returns (address stakingToken, bool isStakingTokenERC20, address rewardToken, address creator, uint104 rewardAmount, uint32 rewardDuration, uint32 totalSkippedDuration, uint40 rewardStartedAt, uint40 cancelledAt, uint128 totalStaked, uint32 activeStakerCount, uint40 lastRewardUpdatedAt, uint256 accRewardPerShare)',
      calls: ids,
      permitFailure: true,
    })

    for (const pool of pools) {
      if (pool.isStakingTokenERC20 && pool.cancelledAt == 0) stakingTokensSet.add(pool.stakingToken)
    }

    const tokens = Array.from(stakingTokensSet)
    if (tokens.length === 0) continue
    await sumTokens2({ api, owner: stakingContract, tokens, permitFailure: true })
  }
  return api.getBalances()
}


chains.forEach(chain => {
  const BOND_CONTRACT = V2_BOND_CONTRACTS[chain] ?? '0xc5a076cad94176c2996B32d8466Be1cE757FAa27'
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.fetchList({ lengthAbi: 'tokenCount', itemAbi: 'tokens', target: BOND_CONTRACT })
      const rTokens = (await api.multiCall({ calls: tokens, itemAbi: 'tokens', target: BOND_CONTRACT, abi: 'function tokenBond(address) view returns (address,  uint16, uint16,  uint40,  address reserveToken, uint256)' })).map(i => i.reserveToken)
      return sumTokens2({ api, owner: BOND_CONTRACT, tokens: rTokens, permitFailure: true, blacklistedTokens: ownTokens[chain] })
    }
  }
  
  if (STAKE_CONTRACTS[chain] || ownTokens[chain]) {
    module.exports[chain].staking = async (api) => {
      if (STAKE_CONTRACTS[chain]) {
        await getStakingTvl(api, STAKE_CONTRACTS[chain]);
      }
      
      // Handle legacy staking logic for ownTokens
      if (ownTokens[chain]) {
        const balances = await api.call({
          target: ownTokens[chain][0],
          abi: 'erc20:balanceOf',
          params: [BOND_CONTRACT]
        });
        api.add(ownTokens[chain][0], balances);
      }
      return api.getBalances()
    }
  }
})