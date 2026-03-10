const { post } = require('../helper/http')
const { callSoroban, decodeStrKey, SOROBAN_RPC_URL } = require('../helper/chain/stellar')

const STAKING_CONTRACT = 'CC72BEVVKHQ57PB5FCKAZYRXCSR6DOQSTN46QR7RZMMM64YWNRPDS24S'
const AQUA_TOKEN = 'CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK'
const POOL_0_SHARE_TOKEN = 'CDMRHKJCYYHZTRQVR7NY43PR7ISMRBYC2O57IMVAQ7B7P2I2XGIZLI5E'
const AQUARIUS_POOL_0 = 'CAMXZXXBD7DFBLYLHUW24U4MY37X7SU5XXT5ZVVUBXRXWLAIM7INI7G2'

// Simulate a read-only Soroban call with one contract address argument
async function callSorobanWithContractArg(contractId, fnName, argContractId) {
  const contractBytes = decodeStrKey(contractId)
  const argBytes = decodeStrKey(argContractId)
  const fnPadLen = fnName.length + ((4 - (fnName.length % 4)) % 4)
  const buf = Buffer.alloc(132 + fnPadLen + 40)
  let o = 0
  buf.writeUInt32BE(2, o); o += 4
  buf.writeUInt32BE(0, o); o += 4
  o += 32
  buf.writeUInt32BE(100, o); o += 4
  buf.writeBigUInt64BE(0n, o); o += 8
  buf.writeUInt32BE(0, o); o += 4
  buf.writeUInt32BE(0, o); o += 4
  buf.writeUInt32BE(1, o); o += 4
  buf.writeUInt32BE(0, o); o += 4
  buf.writeUInt32BE(24, o); o += 4
  buf.writeUInt32BE(0, o); o += 4
  buf.writeUInt32BE(1, o); o += 4
  contractBytes.copy(buf, o); o += 32
  buf.writeUInt32BE(fnName.length, o); o += 4
  buf.write(fnName, o, 'utf8'); o += fnPadLen
  buf.writeUInt32BE(1, o); o += 4
  buf.writeUInt32BE(18, o); o += 4
  buf.writeUInt32BE(1, o); o += 4
  argBytes.copy(buf, o); o += 32
  buf.writeUInt32BE(0, o); o += 4
  buf.writeUInt32BE(0, o); o += 4
  buf.writeUInt32BE(0, o); o += 4

  const response = await post(SOROBAN_RPC_URL, {
    jsonrpc: '2.0', id: 1,
    method: 'simulateTransaction',
    params: { transaction: buf.toString('base64') }
  })

  if (response.error) throw new Error(`Soroban RPC error: ${JSON.stringify(response.error)}`)
  const resultXdr = response?.result?.results?.[0]?.xdr
  if (!resultXdr) return 0n

  const res = Buffer.from(resultXdr, 'base64')
  const type = res.readUInt32BE(0)
  if (type === 9) {
    const hi = res.readBigUInt64BE(4), lo = res.readBigUInt64BE(12)
    return (hi << 64n) + lo
  }
  if (type === 10) {
    const hi = res.readBigInt64BE(4), lo = res.readBigUInt64BE(12)
    return (hi << 64n) | lo
  }
  return 0n
}

// TVL: everything — staking (AQUA locked + BLUB staked) + LP positions (POL + vault)
async function tvl(api) {
  // Staking: AQUA locked by stakers
  const state = await callSoroban(STAKING_CONTRACT, 'get_global_state')
  if (state && state.total_locked != null) {
    api.add(AQUA_TOKEN, state.total_locked)
  }

  // Staking: BLUB staked in the contract — priced as AQUA (1:1 proxy, no separate price feed)
  const blubBalance = await callSorobanWithContractArg(
    'CBMFDIRY5OKI4JJURXC4SMEQPWB4UUADIADJK4NA6CYBNOYK4W4TMLLF',
    'balance',
    STAKING_CONTRACT,
  )
  if (blubBalance > 0n) {
    api.add(AQUA_TOKEN, blubBalance)
  }

  // LP positions (POL + vault deposits) in Aquarius BLUB-AQUA pool
  const lpBalance = await callSorobanWithContractArg(POOL_0_SHARE_TOKEN, 'balance', STAKING_CONTRACT)
  const reserves = await callSoroban(AQUARIUS_POOL_0, 'get_reserves')
  const totalShares = await callSoroban(AQUARIUS_POOL_0, 'get_total_shares')

  if (lpBalance > 0n && reserves && totalShares) {
    const ratio = Number(lpBalance) / Number(totalShares)
    // Aquarius pool orders by contract address: AQUA < BLUB
    const aquaInLp = BigInt(Math.round(Number(reserves[0]) * ratio))
    const blubInLp = BigInt(Math.round(Number(reserves[1]) * ratio))
    api.add(AQUA_TOKEN, aquaInLp)
    // BLUB priced as AQUA (1:1 proxy)
    api.add(AQUA_TOKEN, blubInLp)
  }
}

module.exports = {
  methodology: 'TVL includes AQUA locked in staking, BLUB staked by users, and underlying tokens in LP positions (protocol-owned liquidity and vault deposits) in the Aquarius BLUB-AQUA pool. BLUB is priced 1:1 with AQUA as a proxy since it lacks a separate price feed.',
  stellar: { tvl },
}
