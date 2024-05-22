const { queryContract } = require('../helper/chain/cosmos')

async function staking(api) {
  const res = await queryContract({ chain: api.chain, contract: "inj1fuf8u3d8fk2p34anz3f72tct6q8sr5hvxxv4x4", data: { state: {} }})
  api.add('coingecko:ninjaroll', res.total_bond_amount/1e18, { skipChain: true, })
}

module.exports = {
  methodology: "TVL counts the ROLL tokens staked in the Ninjaroll staking contract",
  injective: { tvl:() => ({}), staking },
};
