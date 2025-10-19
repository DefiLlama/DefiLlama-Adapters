const { queryContract } = require("../helper/chain/cosmos");
const CORE_ASSETS = require('../helper/coreAssets.json');

const consts = {
  EBABY_CONTRACT: 'bbn1m7zr5jw4k9z22r9ajggf4ucalwy7uxvu9gkw6tnsmv42lvjpkwasagek5g',
}

async function eBabyTVL(api) {
  const data = await queryContract({
    contract: consts.EBABY_CONTRACT,
    chain: api.chain,
    data: { staking_liquidity: {} },
  });

  // 
  const totalStakedAmount = parseInt(data.amount);

  const token = CORE_ASSETS.babylon.BABY;
  api.add(token, totalStakedAmount);
}

async function eUTVL(api) {
  const lcd = 'https://rest.union.build';
  const delegator = 'union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v';

  const res = await fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`);
  const json = await res.json();
  const delegations = Array.isArray(json?.delegation_responses) ? json.delegation_responses : [];

  let tvlAtomic = 0;
  for (const d of delegations) {
    tvlAtomic += Number(d?.balance?.amount || 0);
  }

  const token = CORE_ASSETS.ethereum.U;
  api.add(token, tvlAtomic);
}

module.exports = {
  babylon: {
    methodology: 'TVL counts the tokens that are locked in the Escher staking hub',
    tvl: eBabyTVL,
  },
  ethereum: {
    methodology: 'TVL counts the token of each delegator',
    tvl: eUTVL,
  },
} //  node test.js projects/escher/index.js