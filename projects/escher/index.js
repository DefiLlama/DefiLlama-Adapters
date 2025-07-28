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


module.exports = {
  methodology: 'TVL counts the tokens that are locked in the Escher staking hub',
  babylon: {
    tvl: eBabyTVL,
  },
} //  node test.js projects/milky-way/index.js