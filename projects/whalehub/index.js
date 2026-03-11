const { callSoroban, callSorobanWithContractArg, callSorobanWithU32Arg } = require('../helper/chain/stellar')

const STAKING_CONTRACT = 'CC72BEVVKHQ57PB5FCKAZYRXCSR6DOQSTN46QR7RZMMM64YWNRPDS24S'
const BLUB_TOKEN = 'CBMFDIRY5OKI4JJURXC4SMEQPWB4UUADIADJK4NA6CYBNOYK4W4TMLLF'
const AQUA_TOKEN = 'CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK'
const POOL_0_SHARE_TOKEN = 'CDMRHKJCYYHZTRQVR7NY43PR7ISMRBYC2O57IMVAQ7B7P2I2XGIZLI5E'
const AQUARIUS_POOL_0 = 'CAMXZXXBD7DFBLYLHUW24U4MY37X7SU5XXT5ZVVUBXRXWLAIM7INI7G2'

// TVL: AQUA locked by stakers
async function tvl(api) {
  const state = await callSoroban(STAKING_CONTRACT, 'get_global_state')
  if (state && state.total_locked != null) {
    api.add(AQUA_TOKEN, state.total_locked)
  }
}

// Staking: BLUB staked in the contract (priced as AQUA)
async function staking(api) {
  const blubBalance = await callSorobanWithContractArg(BLUB_TOKEN, 'balance', STAKING_CONTRACT)
  if (blubBalance > 0n) {
    api.add(AQUA_TOKEN, blubBalance)
  }
}

// Pool2: vault user LP deposits in the Aquarius BLUB-AQUA pool (excludes POL)
async function pool2(api) {
  const [poolInfo, reserves, totalShares] = await Promise.all([
    callSorobanWithU32Arg(STAKING_CONTRACT, 'get_pool_info', 0),
    callSoroban(AQUARIUS_POOL_0, 'get_reserves'),
    callSoroban(AQUARIUS_POOL_0, 'get_total_shares'),
  ])

  if (!poolInfo || !reserves || !totalShares) return

  const vaultLp = poolInfo.total_lp_tokens != null ? BigInt(poolInfo.total_lp_tokens) : 0n
  if (vaultLp <= 0n) return

  const ratio = Number(vaultLp) / Number(totalShares)
  // Aquarius pool orders by contract address: AQUA < BLUB
  const aquaInLp = BigInt(Math.round(Number(reserves[0]) * ratio))
  const blubInLp = BigInt(Math.round(Number(reserves[1]) * ratio))
  api.add(AQUA_TOKEN, aquaInLp)
  api.add(AQUA_TOKEN, blubInLp)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL counts AQUA locked in staking. Staking counts BLUB staked by users. Pool2 counts vault user LP deposits in the Aquarius BLUB-AQUA pool. BLUB is priced as AQUA since it lacks a separate price feed. Protocol-owned liquidity is tracked separately in treasury.',
  stellar: { tvl, staking, pool2 },
}
