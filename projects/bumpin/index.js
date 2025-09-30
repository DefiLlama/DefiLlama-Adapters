const {getProvider, sumTokens2,} = require('../helper/solana')
const {Program} = require("@coral-xyz/anchor");
const {PublicKey} = require('@solana/web3.js');

async function tvl() {
    const provider = getProvider()

    const programId = new PublicKey('bumpinX5wdLt59DBR3eetmV6xB2W3rNGxMoTSc58ah2')
    const idl = await Program.fetchIdl(programId, provider)
    // idl's address maybe wrong, force update idl address
    idl.address = "bumpinX5wdLt59DBR3eetmV6xB2W3rNGxMoTSc58ah2";
    const program = new Program(idl, provider)

    const poolData = await program.account.pool.all()
    const tokenData = await program.account.tradeToken.all()
    const tokenVault = await program.account.tokenVault.all();
    const tokenAccounts = []
    const blacklistedTokens = []
    
    poolData.forEach(({account: i}) => {
        blacklistedTokens.push(i.launcherMint.toString())
        tokenAccounts.push(i.poolVaultKey.toString())
    });
    tokenData.forEach(({account: i}) => {
        tokenAccounts.push(i.vaultKey.toString())
    });
    tokenVault.forEach(({account: i}) => {
        tokenAccounts.push(i.vaultKey.toString())
    });

    const uniqueTokenAccounts = [...new Set(tokenAccounts)];
    return sumTokens2({
        tokenAccounts: uniqueTokenAccounts.filter(i => i !== '11111111111111111111111111111111'),
        blacklistedTokens, 
        api: api => {
            tokenVault.forEach((data) => {
                const mint = data.account.mintKey.toString()
                api.add(mint, data.account.totalBorrowed)
            })
        }
    })
}

module.exports = {
    timetravel: false,
    solana: {tvl,},
}