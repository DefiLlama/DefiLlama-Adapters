const { queryContract, queryV1Beta1 } = require("../helper/chain/cosmos");
const CORE_ASSETS = require('../helper/coreAssets.json');

const config = {
  EBABY_CONTRACT: 'bbn1m7zr5jw4k9z22r9ajggf4ucalwy7uxvu9gkw6tnsmv42lvjpkwasagek5g',
  U_DELEGATOR: 'union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v',
  U_COINGECKO: 'coingecko:union-2'
}

async function eBabyTVL(api) {
  const data = await queryContract({
    contract: config.EBABY_CONTRACT,
    chain: api.chain,
    data: { staking_liquidity: {} },
  });

  // 
  const totalStakedAmount = parseInt(data.amount);

  const token = CORE_ASSETS.babylon.BABY;
  api.add(token, totalStakedAmount);
}

async function eUTVL(api) {
  const data = await queryV1Beta1({
    chain: api.chain,
    url: `staking/v1beta1/delegations/${config.U_DELEGATOR}`
  });
  const delegations = Array.isArray(data?.delegation_responses) ? data.delegation_responses : [];

  let tvlAtomic = 0;
  for (const d of delegations) {
    tvlAtomic += Number(d?.balance?.amount || 0);
  }
  tvlAtomic /= 10 ** 18;

  api.add(config.U_COINGECKO, tvlAtomic, { skipChain: true });
}

module.exports = {
  babylon: {
    methodology: 'TVL counts the tokens that are locked in the Escher staking hub',
    tvl: eBabyTVL,
  },
  union: {
    methodology: 'TVL counts the token of each delegator',
    tvl: eUTVL,
  },
} //  node test.js projects/escher/index.js