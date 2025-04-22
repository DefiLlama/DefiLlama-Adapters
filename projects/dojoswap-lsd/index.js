const { queryContract } = require('../helper/chain/cosmos')

const ADDRESSES = {
  LSD_CONTRACT: 'inj17glv5mk2pvhpwkdjljacmr2fx9pfc3djepy6xh',
  STAKED_INJ_TOKEN_CONTRACT: 'inj134wfjutywny9qnyux2xgdmm0hfj7mwpl39r3r9',
  MULTICAL_CONTRACT: 'inj1578zx2zmp46l554zlw5jqq3nslth6ss04dv0ee'
}

async function tvl(api) {
  const data = await queryContract({chain: api.chain, contract: ADDRESSES.LSD_CONTRACT,  data: { state: {} }})

  return {
    'injective-protocol': data.tvl_utoken / 1e18,
  }
}

module.exports = {
  methodology: "Liquidity on LSD staking",
  injective: { tvl },
};
