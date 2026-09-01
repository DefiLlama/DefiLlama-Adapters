const {getProvider, sumTokens2,} = require('../helper/solana')
const {Program} = require("@coral-xyz/anchor");
const {PublicKey} = require('@solana/web3.js');
const idl = require('./bumpin_trade.json');

async function tvl(api) {
    const provider = getProvider()
    const program = new Program(idl, provider)

    const poolData = await program.account.pool.all()
    const tokenData = await program.account.tradeToken.all()
    
    const tokenVault = program.account.tokenVault ? await program.account.tokenVault.all() : [];
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
    if (tokenVault && tokenVault.length > 0) {
        tokenVault.forEach((data) => {
            const mint = data.account.mintKey.toString()
            api.add(mint, data.account.totalBorrowed)
        })
    }

    return sumTokens2({
        tokenAccounts: uniqueTokenAccounts.filter(i => i !== '11111111111111111111111111111111'),
        blacklistedTokens, 
        allowError: true,
        api
    })
}

module.exports = {
    timetravel: false,
    solana: {tvl,},
}