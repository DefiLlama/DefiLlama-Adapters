const { queryContract } = require('../helper/chain/cosmos')

async function tvl() {
  const res = await queryContract({ chain: 'terra2', contract: 'terra188mmw2vsp0yahen3vh2clup543qrttvdzkxl0h9myfuwjj56nausztpegt', data: { state: {}}})

  return {
    "terra-luna-2": res.total_bond_amount / 1e6,
  }
}


module.exports = {
  timetravel: false,
  terra: {
    tvl: () => 0,
  },
  terra2: {
    tvl,
  },
  hallmarks:[
    [1651881600, "UST depeg"],
  ]
}
