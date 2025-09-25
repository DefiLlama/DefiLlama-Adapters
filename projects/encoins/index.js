const { sumTokens2 } = require("../helper/chain/cardano")
const { get } = require("../helper/http")
const EncoinsLedgerAddress = 'addr1q8u2rh5uud6yzmhq0de7vt7p0rvqpfadwnee3tjnz2tl4rct6qt03wjc2lfwyqnd54gwfdey50s7342e3jl6kxwww4kqzfah2x'
const EncoinsWalletAddress = 'addr1zxf7ugf90tp2zfhr47e88jl4jc6nvhtl24r4r2und09dmuqt6qt03wjc2lfwyqnd54gwfdey50s7342e3jl6kxwww4kquasqvy'
const Encoins_Token = 'cardano:9abf0afd2f236a19f2842d502d0450cbcd9c79f123a9708f96fd9b96454e4353'

async function tvl() {
    const lockedAssets = await sumTokens2({
        owners: [EncoinsLedgerAddress, EncoinsWalletAddress]
    })
    return lockedAssets
}

async function stake() {
    const RegisteredRelayNodes = await get('https://l2y0u35vje.execute-api.eu-central-1.amazonaws.com/servers');
    const relayNodeBalances = Object.values(RegisteredRelayNodes).reduce((acc, value) => acc + value, 0);
    return {
        [Encoins_Token]: relayNodeBalances
    }
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl,
        staking: stake
    }
}
