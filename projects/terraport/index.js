const { queryContract } = require('../helper/chain/cosmos');

// Terraport contract addresses on Terra Classic
const FACTORY_CONTRACT = 'terra1n75fgfc8clsssrm2k0fswgtzsvstdaah7la6sfu96szdu22xta0q57rqqr';
const STAKING_CONTRACT = 'terra134ummlrj2rnv8h8rjhs6a54fng0xlg8wk7a2gwu6vj42pznkf6xs95966d';
const VESTING_CONTRACT = 'terra19v3vkpxsxeach4tpdklxaxc9wuwx65jqfs6jzm5cu5yz457hhgmsp4a48n';

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

async function tvl(api) {
  const pairs = await getAllPairs();
  const poolContracts = pairs.map((p) => p.contract_addr).filter(Boolean);

  const poolBalances = await Promise.all(
    poolContracts.map(async (pool) => {
      const result = await queryContract({
        contract: pool,
        chain: 'terra',
        data: { pool: {} },
      }).catch((err) => {
        throw new Error(`Failed to query pool ${pool}: ${err.message || err}`);
      });
      return result?.assets ?? [];
    })
  );

  for (const assets of poolBalances) {
    for (const asset of assets) {
      const info = asset.info;
      const amount = asset.amount;

      if (info.native_token) {
        api.add(info.native_token.denom, amount);
      } else if (info.token) {
        api.add(info.token.contract_addr, amount);
      }
    }
  }

  const stakingState = await queryContract({
    contract: STAKING_CONTRACT,
    chain: 'terra',
    data: { state: {} },
  }).catch((err) => {
    throw new Error(`Failed to query staking contract: ${err.message || err}`);
  });

  if (stakingState?.total_bond_amount) {
    api.add('uluna', stakingState.total_bond_amount);
  }

  const vestingState = await queryContract({
    contract: VESTING_CONTRACT,
    chain: 'terra',
    data: { state: {} },
  }).catch((err) => {
    throw new Error(`Failed to query vesting contract: ${err.message || err}`);
  });

  if (vestingState?.total_granted) {
    api.add('uluna', vestingState.total_granted);
  } else if (vestingState?.total_amount) {
    api.add('uluna', vestingState.total_amount);
  }
}

async function staking(api) {
  const stakingState = await queryContract({
    contract: STAKING_CONTRACT,
    chain: 'terra',
    data: { state: {} },
  }).catch((err) => {
    throw new Error(`Failed to query staking contract: ${err.message || err}`);
  });

  if (stakingState?.total_bond_amount) {
    api.add('uluna', stakingState.total_bond_amount);
  }
}

async function vesting(api) {
  const vestingState = await queryContract({
    contract: VESTING_CONTRACT,
    chain: 'terra',
    data: { state: {} },
  }).catch((err) => {
    throw new Error(`Failed to query vesting contract: ${err.message || err}`);
  });

  if (vestingState?.total_granted) {
    api.add('uluna', vestingState.total_granted);
  } else if (vestingState?.total_amount) {
    api.add('uluna', vestingState.total_amount);
  }
}

module.exports = {
  methodology:
    'TVL is calculated by summing the value of assets in all Terraport liquidity pools (fetched from the factory contract) plus tokens locked in the staking and vesting contracts.',
  timetravel: false,
  terra: {
    tvl,
    staking,
    vesting,
  },
};
