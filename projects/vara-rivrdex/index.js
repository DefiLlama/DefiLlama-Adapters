const { post } = require('../helper/http')

const VARA_RPC = 'https://rpc.vara.network'
const PAIR_ADDRESS = '0x038534fe3ec91c4a9b4074f14908bfeca6358da0515772a428d8c489fdd134a1'
const GAS_LIMIT = 750000000000

function scaleStr(s) {
    const b = Buffer.from(s, 'utf8')
    return Buffer.concat([Buffer.from([b.length << 2]), b])
}

// A sails request/reply is prefixed with its route (e.g. Pair::GetReserves): https://github.com/gear-tech/sails/blob/master/js/src/prefix.ts
const ROUTE = Buffer.concat([scaleStr('Pair'), scaleStr('GetReserves')])

function decodeU256LE(bytes) {
    let bal = 0n
    for (let i = bytes.length - 1; i >= 0; i--) bal = (bal << 8n) | BigInt(bytes[i])
    return bal
}

async function getReserves() {
    const reqPayload = '0x' + ROUTE.toString('hex')
    const { result, error } = await post(VARA_RPC, {
        jsonrpc: '2.0',
        id: 1,
        method: 'gear_calculateReplyForHandle',
        params: ['0x' + '0'.repeat(64), PAIR_ADDRESS, reqPayload, GAS_LIMIT, 0],
    })

    if (error || !result || !result.payload || result.payload === '0x') {
        throw new Error(`vara-rivrdex: failed to read pair reserves: ${JSON.stringify(error || (result && result.code))}`)
    }

    // returned as <route><reserve0><reserve1> so we strip route prefix and decode both u256 values
    const bytes = Buffer.from(result.payload.slice(2), 'hex').subarray(ROUTE.length)
    return {
        reserve0: decodeU256LE(bytes.subarray(0, 32)),
        reserve1: decodeU256LE(bytes.subarray(32, 64)),
    }
}

async function tvl(api) {
    const { reserve0, reserve1 } = await getReserves()

    api.addCGToken('vara-network', Number(reserve0) / 1e12)
    api.addCGToken('tether', Number(reserve1) / 1e6)
}

module.exports = {
    methodology: 'TVL is the value of VARA and WUSDT reserves in the RivrDex VARA/WUSDT pair contract on Vara, excluding fee accrual on raw token balances.',
    vara: { tvl },
}
