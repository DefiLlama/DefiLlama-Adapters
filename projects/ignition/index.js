const { getConnection } = require('../helper/solana')
const { decodeAccount } = require('../helper/utils/solana/layout')
const { PublicKey } = require('@solana/web3.js')

async function tvl() {
    const connection = getConnection('fogo');
    const stakePoolAddress = new PublicKey('ign1zuR3YsvLVsEu8WzsyazBA8EVWUxPPHKnhqhoSTB')
    const accountInfo = await connection.getAccountInfo(stakePoolAddress);
    const deserializedAccountInfo = decodeAccount('stakePool', accountInfo)

    const totalStakedLamports = +deserializedAccountInfo.totalLamports

    return {
        fogo: Number(totalStakedLamports) / 1e9,
    };
}

module.exports = {
    timetravel: false,
    methodology: "TVL is the total FOGO staked in the Ignition stake pool",
    fogo: {
        tvl
    }
}