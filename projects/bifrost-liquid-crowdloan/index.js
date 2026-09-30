const { getStorage, decodeUint } = require('../helper/chain/substrate')
const { vsToken, vsToken2 } = require('../helper/chain/bifrostCurrency')
const { getEnv } = require('../helper/env')

// Salp tvl: Tokens.TotalIssuance(vsKSM) on bifrost-kusama and Tokens.TotalIssuance(vsDOT) on bifrost-polkadot
const totalIssuance = async (rpc, currencyId) => decodeUint(await getStorage(rpc, { pallet: 'Tokens', item: 'TotalIssuance', key: currencyId }))

async function tvl() {
  const vsKSM = await totalIssuance(getEnv('BIFROST_KUSAMA_RPC'), vsToken('KSM'))
  const vsDOT = await totalIssuance(getEnv('BIFROST_POLKADOT_RPC'), vsToken2(0))

  return {
    kusama: Number(vsKSM) / 1e12,
    polkadot: Number(vsDOT) / 1e10,
  }
}

module.exports = {
  timetravel: false,
  methodology: "Minted vTokens from other chains (only calculate the underlying asset value)",
  bifrost: { tvl }
};
