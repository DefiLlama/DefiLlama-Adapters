const { callSoroban } = require('../helper/chain/stellar')
const { lockedAqua } = require('../whalehub/iceLocks')

const STAKING_CONTRACT = 'CC72BEVVKHQ57PB5FCKAZYRXCSR6DOQSTN46QR7RZMMM64YWNRPDS24S'
const AQUA_TOKEN = 'CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK'
const POOL_0_SHARE_TOKEN = 'CDMRHKJCYYHZTRQVR7NY43PR7ISMRBYC2O57IMVAQ7B7P2I2XGIZLI5E'
const AQUARIUS_POOL_0 = 'CAMXZXXBD7DFBLYLHUW24U4MY37X7SU5XXT5ZVVUBXRXWLAIM7INI7G2'

// Treasury: AQUA the protocol locked for ICE from its own funds, plus
// protocol-owned liquidity in the Aquarius BLUB-AQUA pool
async function tvl(api) {
  const { protocol } = await lockedAqua()
  if (protocol > 0) api.add(AQUA_TOKEN, Math.round(protocol * 1e7))

  const [lpBalance, poolInfo, reserves, totalShares] = await Promise.all([
    callSoroban(POOL_0_SHARE_TOKEN, 'balance', [STAKING_CONTRACT]),
    callSoroban(STAKING_CONTRACT, 'get_pool_info', [0]),
    callSoroban(AQUARIUS_POOL_0, 'get_reserves'),
    callSoroban(AQUARIUS_POOL_0, 'get_total_shares'),
  ])

  if (!lpBalance || !poolInfo || !reserves || !totalShares) return

  const vaultLp = poolInfo.total_lp_tokens != null ? BigInt(poolInfo.total_lp_tokens) : 0n
  const polLp = BigInt(lpBalance) - vaultLp
  if (polLp <= 0n) return

  const ratio = Number(polLp) / Number(totalShares)
  const aquaInLp = BigInt(Math.round(Number(reserves[0]) * ratio))
  const blubInLp = BigInt(Math.round(Number(reserves[1]) * ratio))
  api.add(AQUA_TOKEN, aquaInLp)
  api.add(AQUA_TOKEN, blubInLp)
}

module.exports = {
  misrepresentedTokens: true,
  stellar: { tvl },
}
