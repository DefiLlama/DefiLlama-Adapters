const { getTrxBalance } = require('../helper/chain/tron');
const STAKINGPOOL_ADDRESS = 'TGrdCu9fu8csFmQptVE25fDzFmPU9epamH';
const FREEZE_ADDRESS = 'TSTrx3UteLMBdeGe9Edwwi2hLeQCmLPZ5g';

async function tvl() {
  const [stakingBalance, freezeBalance] = await Promise.all([
    getTrxBalance(STAKINGPOOL_ADDRESS),
    getTrxBalance(FREEZE_ADDRESS),
  ]);
  return  {
    "tron": (stakingBalance + freezeBalance) / 10 ** 6,
  };
}

module.exports = {
  tron: {
    tvl,
  },
}