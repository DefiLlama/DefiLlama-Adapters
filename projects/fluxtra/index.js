const { queryContract } = require('../helper/chain/cosmos')

const ADDRESSES = {
  LSD_CONTRACT: 'mantra1e7kn2n6p9qsxxkght69s485dxeln29u8kq75r06lywmv9j7kh4lqq4cyeh',
}

async function tvl(api) {
  const data = await queryContract({ chain: 'mantra', contract: ADDRESSES.LSD_CONTRACT, data: { state: {} } })
  api.add('uom', data.tvl_utoken)
}

module.exports = {
  methodology: "Liquidity on LSD staking",
  mantra: { tvl },
};
