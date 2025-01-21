const { Program, } = require("@project-serum/anchor");
const { getProvider, sumTokens2, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, decodeAccount, getConnection } = require('./helper/solana')
const { PublicKey } = require("@solana/web3.js");

const VAULT_PROGRAM_ID = new PublicKey('24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi')
function getTokenAccount(owner,) {
  if (typeof owner === 'string') owner = new PublicKey(owner)
  const [associatedTokenAddress] = PublicKey.findProgramAddressSync(["token_vault", owner.toBuffer()], VAULT_PROGRAM_ID);
  return associatedTokenAddress.toString()
}

async function getStableSwapTokenAccounts() {
  const connection = getConnection()

  const programPublicKey = new PublicKey('MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky')
  const programAccounts = await connection.getProgramAccounts(programPublicKey, {
    filters: [{ dataSize: 265 }]
  });

  return programAccounts.map((account) => {
    const i = decodeAccount('meteoraStablePool', account.account)
    return i.tokenAccounts.map(i => i.toString()).filter(i => i !== '11111111111111111111111111111111') // remove empty accounts
  }).flat()
}

async function tvl(api) {
  const provider = getProvider()
  const programId = 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const pools = await program.account.pool.all()
  const tokenAccounts = await getStableSwapTokenAccounts()
  api.log('meteora pools', pools.length)
  pools.forEach(({ account: i }) => {
    tokenAccounts.push(getTokenAccount(i.aVault))
    tokenAccounts.push(getTokenAccount(i.bVault))
  })
  await sumTokens2({ tokenAccounts, api })
  api.removeTokenBalance('solana:AwRErBEFGTnohzfLeRSBH9HddQEy2oeRxnWLrbvFFh95')
}

module.exports = {
  isHeavyProtocol: true,
  timetravel: false,
  solana: { tvl, },
  methodology:
    "To obtain the Mercurial TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the 3pool addresses and the SOL 2pool address where the corresponding tokens were deposited and these addresses are hard-coded. This returns the number of tokens held in each contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.",
}