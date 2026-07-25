const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { post } = require('../helper/http')

const ERC20_MANAGER = '0x16fCff97822fcf3345Fa76D29c229b11C49EaE12';

const VARA_RPC = 'https://rpc.vara.network'
const WVARA_VFT = '0x29c42c668012b1ce20720e4615229215023281ef4676fdc77bf047d7fbcb9d17'
const VFT_MANAGER = '0xe01ddc667f80cf57704352b557668b710c345395abcac0752c01402d16e3e81b'
const GAS_LIMIT = 750000000000

// SCALE-encode a string: https://github.com/paritytech/parity-scale-codec
function scaleStr(s) { const b = Buffer.from(s, 'utf8'); return Buffer.concat([Buffer.from([b.length << 2]), b]) }
// A sails request/reply is prefixed with its route (e.g. Vft::BalanceOf): https://github.com/gear-tech/sails/blob/master/js/src/prefix.ts
const ROUTE = Buffer.concat([scaleStr('Vft'), scaleStr('BalanceOf')])

async function tvl(api) {
    await sumTokens2({
        api,
        owners: [ERC20_MANAGER],
        tokens: [
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.USDT,
            ADDRESSES.ethereum.WETH,
            ADDRESSES.ethereum.WBTC,
        ],
    })
}

async function varaTvl(api) {
    const account = Buffer.from(VFT_MANAGER.slice(2), 'hex')
    const reqPayload = '0x' + Buffer.concat([ROUTE, account]).toString('hex')
    const { result, error } = await post(VARA_RPC, {
        jsonrpc: '2.0', id: 1, method: 'gear_calculateReplyForHandle',
        params: ['0x' + '0'.repeat(64), WVARA_VFT, reqPayload, GAS_LIMIT, 0],
    })
    if (error || !result || !result.payload || result.payload === '0x')
        throw new Error(`vara: failed to read vft-manager WVARA balance: ${JSON.stringify(error || (result && result.code))}`)

    // returned as <route><balance> so we strip route prefix
    const bytes = Buffer.from(result.payload.slice(2), 'hex').slice(ROUTE.length)
    let bal = 0n
    for (let i = bytes.length - 1; i >= 0; i--) bal = (bal << 8n) | BigInt(bytes[i])
    api.addCGToken('vara-network', Number(bal) / 1e12)
}

module.exports = {
    methodology: 'On Ethereum, TVL is the value of tokens locked in the ERC20Manager contract (which back their tokenized versions on Vara). On Vara, TVL is the value of VARA bridged to Ethereum, measured as the WVARA locked in the vft-manager (the collateral backing WVARA minted on Ethereum). Only tokens officially supported by the Vara ⇌ Ethereum Bridge are counted.',
    ethereum: { tvl },
    vara: { tvl: varaTvl },
};
