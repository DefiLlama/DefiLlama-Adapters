const { queryContract } = require('../helper/chain/cosmos');

// Terraport contract addresses on Terra Classic
const FACTORY_CONTRACT = 'terra1n75fgfc8clsssrm2k0fswgtzsvstdaah7la6sfu96szdu22xta0q57rqqr';
const TOKEN_CODE_ID = 'terra1ex0hjv3wurhj4wgup4jzlzaqj4av6xqd8le4etml7rg9rs207y4s8cdvrp';
const STAKING_CONTRACT = 'terra134ummlrj2rnv8h8rjhs6a54fng0xlg8wk7a2gwu6vj42pznkf6xs95966d';
const ROUTER_CONTRACT = 'terra1vrqd7fkchyc7wjumn8fxly88z7kath4djjls3yc5th5g76f3543salu48s';
const VESTING_CONTRACT = 'terra19v3vkpxsxeach4tpdklxaxc9wuwx65jqfs6jzm5cu5yz457hhgmsp4a48n';

// Fetch all pairs from the factory contract
async function getAllPairs() {
  let pairs = [];
  let startAfter = undefined;
  const limit = 30;

  while (true) {
    const query = {
      pairs: {
        limit,
        ...(startAfter ? { start_after: startAfter } : {}),
      },
    };

    const result = await queryContract({ contract: FACTORY_CONTRACT, chain: 'terra', data: query });
    const fetchedPairs = result?.pairs ?? [];
    pairs = pairs.concat(fetchedPairs);

    if (fetchedPairs.length < limit) break;

    const last = fetchedPairs[fetchedPairs.length - 1];
    startAfter = last?.asset_infos;
  }

  return pairs;
}

// TVL: sum liquidity across all DEX pools + staking contract
async function tvl(api) {
  const pairs = await getAllPairs();

  const poolContracts = pairs.map((p) => p.contract_addr).filter(Boolean);

  // For each pool, get the pool balances
  const poolBalances = await Promise.all(
    poolContracts.map(async (pool) => {
      try {
        const result = await queryContract({
          contract: pool,
          chain: 'terra',
          data: { pool: {} },
        });
        return result?.assets ?? [];
      } catch {
        return [];
      }
    })
  );

  for (const assets of poolBalances) {
    for (const asset of assets) {
      const info = asset.info;
      const amount = asset.amount;

      if (info.native_token) {
        api.add(info.native_token.denom, amount);
      } else if (info.token) {
        api.add(`terra-classic:${info.token.contract_addr}`, amount);
      }
    }
  }

  // Staking TVL
  try {
    const stakingState = await queryContract({
      contract: STAKING_CONTRACT,
      chain: 'terra',
      data: { state: {} },
    });

    if (stakingState?.total_bond_amount) {
      api.add('uluna', stakingState.total_bond_amount);
    }
  } catch {
    // Staking query failed silently
  }

  // Vesting TVL — tokens locked in vesting contract
  try {
    const vestingState = await queryContract({
      contract: VESTING_CONTRACT,
      chain: 'terra',
      data: { state: {} },
    });

    if (vestingState?.total_granted) {
      api.add('uluna', vestingState.total_granted);
    } else if (vestingState?.total_amount) {
      api.add('uluna', vestingState.total_amount);
    }
  } catch {
    // Vesting query failed silently
  }
}

// Staking module (separate breakdown)
async function staking(api) {
  try {
    const stakingState = await queryContract({
      contract: STAKING_CONTRACT,
      chain: 'terra',
      data: { state: {} },
    });

    if (stakingState?.total_bond_amount) {
      api.add('uluna', stakingState.total_bond_amount);
    }
  } catch {
    // Staking query failed silently
  }
}

// Vesting module (separate breakdown)
async function vesting(api) {
  try {
    const vestingState = await queryContract({
      contract: VESTING_CONTRACT,
      chain: 'terra',
      data: { state: {} },
    });

    if (vestingState?.total_granted) {
      api.add('uluna', vestingState.total_granted);
    } else if (vestingState?.total_amount) {
      api.add('uluna', vestingState.total_amount);
    }
  } catch {
    // Vesting query failed silently
  }
}

module.exports = {
  methodology:
    'TVL is calculated by summing the value of assets in all Terraport liquidity pools (fetched from the factory contract) plus tokens locked in the staking contract.',
  
  timetravel: false,
  
  terra: {
    tvl,
    staking,
    vesting,
  },
};
