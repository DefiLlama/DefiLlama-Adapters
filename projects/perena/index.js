const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require('@solana/web3.js');

async function tvl() {
  const provider = getProvider()

  const programId = new PublicKey('NUMERUNsFCP3kuNmWZuXtm1AaQCPj9uw6Guv2Ekoi5P')
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)

  // this filter is needed because the call fails, there are some bad pools that fail to decode
  const poolData = await program.account.stablePool.all([{ dataSize: program.account.stablePool._size }])

  const tokenAccounts = []
  const blacklistedTokens = []
  poolData.forEach(({ account: i }) => {
    blacklistedTokens.push(i.lpMint.toString())
    i.pairs.forEach(pair => {
      tokenAccounts.push(pair.xVault.toString())
    })
  })
  return sumTokens2({ tokenAccounts: tokenAccounts.filter(i => i !== '11111111111111111111111111111111'), blacklistedTokens, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}