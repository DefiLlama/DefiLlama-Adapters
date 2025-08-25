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
  ethereum: '0x5b64cECC5cF3E4B1A668Abd895D16BdDC0c77a17',
  optimism: '0x29b0E6D2C2884aEa3FB4CB5dD1C7002A8E10c724',
  arbitrum: '0x7B09b728ee8c6a714dC3F10367b5DF9b217FE633',
  avax: '0x95BDA90196c4e737933360F4639c46Ace657AAb7',
  polygon: '0x5b64cECC5cF3E4B1A668Abd895D16BdDC0c77a17',
  bsc: '0x5b64cECC5cF3E4B1A668Abd895D16BdDC0c77a17',
  base: '0x364e0f814a2c5524d26e82937815c574f8bB86C1',
  blast: '0x95BDA90196c4e737933360F4639c46Ace657AAb7',
  degen: '0x9a176d09b3824cf50417e348696cBbBc43d7818d',
  zora: '0x621c335b4BD8f2165E120DC70d3AfcAfc6628681',
  klaytn: '0x06FD26c092Db44E5491abB7cDC580CE24D93030c',
  cyber: '0x621c335b4BD8f2165E120DC70d3AfcAfc6628681',
  apeChain: '0xF44939c1613143ad587c79602182De7DcF593e33',
  shibarium: '0xF44939c1613143ad587c79602182De7DcF593e33',
  hashkey: '0xF44939c1613143ad587c79602182De7DcF593e33',
  unichain: '0xF44939c1613143ad587c79602182De7DcF593e33',
  over: '0xF44939c1613143ad587c79602182De7DcF593e33',
}

const ownTokens = {
  bsc: ['0x1f3Af095CDa17d63cad238358837321e95FC5915']
}

async function getStakingTvl(api, stakingContract) {
  const poolCount = await api.call({
    target: stakingContract,
    abi: 'function poolCount() view returns (uint256)'
  });

  if (poolCount == 0) return;

  const BATCH_SIZE = 50;
  const stakingTokensSet = new Set();
  
  for (let i = 0; i < poolCount; i += BATCH_SIZE) {
    const fromId = i;
    const toId = Math.min(i + BATCH_SIZE - 1, poolCount - 1);
    
    try {
      const resp = await api.call({
        target: stakingContract,
        abi: 'function getPools(uint256 poolIdFrom, uint256 poolIdTo) view returns (tuple(tuple(address stakingToken, bool isStakingTokenERC20, address rewardToken, address creator, uint104 rewardAmount, uint32 rewardDuration, uint32 totalSkippedDuration, uint40 rewardStartedAt, uint40 cancelledAt, uint128 totalStaked, uint32 activeStakerCount, uint40 lastRewardUpdatedAt, uint256 accRewardPerShare) pool, tuple(string symbol, string name, uint8 decimals) stakingToken, tuple(string symbol, string name, uint8 decimals) rewardToken)[] poolList)',
        params: [fromId, toId]
      });
      const pools = resp?.poolList ?? resp; 

      for (const poolView of pools) {
        const pool = poolView.pool;
        if (pool?.isStakingTokenERC20 && pool?.cancelledAt == 0) {
          stakingTokensSet.add(pool.stakingToken);
        }
      }
    } catch (error) {
      // Fallback: read individual pool structs via mapping
      try {
        const ids = Array.from({ length: toId - fromId + 1 }, (_, k) => fromId + k)
        const pools = await api.multiCall({
          target: stakingContract,
          abi: 'function pools(uint256) view returns (address stakingToken, bool isStakingTokenERC20, address rewardToken, address creator, uint104 rewardAmount, uint32 rewardDuration, uint32 totalSkippedDuration, uint40 rewardStartedAt, uint40 cancelledAt, uint128 totalStaked, uint32 activeStakerCount, uint40 lastRewardUpdatedAt, uint256 accRewardPerShare)',
          calls: ids,
          permitFailure: true,
        })
        for (const pool of pools) {
          if (!pool) continue
          if (pool.isStakingTokenERC20 && pool.cancelledAt == 0) stakingTokensSet.add(pool.stakingToken)
        }
      } catch (e2) {
        console.warn(`Failed to fetch pools ${fromId}-${toId} for staking contract ${stakingContract}:`, error.message);
      }
    }
  }

  const tokens = Array.from(stakingTokensSet);
  if (tokens.length === 0) return;
  try {
    const balances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: tokens.map(t => ({ target: t, params: [stakingContract] })),
      permitFailure: true,
    })
    for (let i = 0; i < tokens.length; i++) {
      const bal = balances[i]
      if (!bal) continue
      api.add(tokens[i], bal)
    }
  } catch (e) {
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