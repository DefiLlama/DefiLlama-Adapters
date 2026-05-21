const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { post } = require('../helper/http')

const ERC20_MANAGER = '0x16fCff97822fcf3345Fa76D29c229b11C49EaE12';

// Storage key: SYSTEM_ACCOUNT_PREFIX + blake2_128(TOKENIZED_VARA) + TOKENIZED_VARA
// 1. SYSTEM_ACCOUNT_PREFIX: 26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9 - xxHash128("System") + xxHash128("Account"): https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/system/src/lib.rs#L977
// 2. blake2_128(tokenized_vara): 2be216337508815d413700122d15f57f - prefix for the AccountId key: https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/support/src/hash.rs#L143
// 3. TOKENIZED_VARA: 29c42c668012b1ce20720e4615229215023281ef4676fdc77bf047d7fbcb9d17
const VARA_BALANCE_STORAGE_KEY = '0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da92be216337508815d413700122d15f57f29c42c668012b1ce20720e4615229215023281ef4676fdc77bf047d7fbcb9d17';
const VARA_RPC = 'https://rpc.vara.network'

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
    const { result } = await post(VARA_RPC, {
        jsonrpc: '2.0', id: 1, method: 'state_getStorage', params: [VARA_BALANCE_STORAGE_KEY],
    })
    if (!result) return

    // AccountInfo<u32, AccountData<u128>>: nonce u32, consumers u32, providers u32, sufficients u32,
    // then AccountData { free u128, reserved u128, frozen u128, flags u128 } — free starts at byte 16.
    // AccountInfo: https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/system/src/lib.rs#L1236
    // AccountData: https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/balances/src/types.rs#L109
    const bytes = Buffer.from(result.slice(2), 'hex')
    const free = bytes.readBigUInt64LE(16) | (bytes.readBigUInt64LE(24) << 64n)
    api.addCGToken('vara-network', Number(free) / 1e12)
}

module.exports = {
    methodology: 'TVL is calculated as the sum of the value of tokens locked on the ERC20Manager contract and the value of VARA tokens bridged from the Vara Network. Only tokens officially supported by the Vara ⇌ Ethereum Bridge are counted.',
    ethereum: { tvl },
    vara: { tvl: varaTvl },
};