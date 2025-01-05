const {PublicKey} = require('@solana/web3.js');
const {Program, AnchorProvider} = require('@coral-xyz/anchor');
const iloopIdl = require('./iloop_sc_mainnet.json');
const {getConnection} = require("../helper/solana");

async function tvl() {
    const provider = new AnchorProvider(getConnection(), {
        publicKey: new PublicKey(0),
    }, {
        preflightCommitment: 'processed',
    });
    const iloopProgram = new Program(iloopIdl, provider);
    const reserves = await iloopProgram.account.reserve.all();
    const tvl = {}
    for (const reserveData of reserves) {
        const reserve = reserveData.account
        tvl[`solana:${reserve.liquidityMint.toBase58()}`] = reserve.liquiditySupplyAmount
    }
    return tvl
}

module.exports = {
    timetravel: false,
    solana: {
        tvl
    },
    methodology: 'TVL consists of deposits made to the protocol, borrowed tokens are not counted.',
};
