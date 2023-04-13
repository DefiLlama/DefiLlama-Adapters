const { getProvider, getConnection, sumTokens2, decodeAccount, } = require("../helper/solana");
const { Program, } = require("@project-serum/anchor");
const { PublicKey, } = require("@solana/web3.js");
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require("bignumber.js");

const programId = 'HedgeEohwU6RqokrvPU4Hb6XKPub8NuKbnPmY7FoMMtN'
const reserves = {
  cusdc: 'BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw',
  cusdt: '8K9WC8xoh2rtQNY7iEGXtPvfbDCi563SdWhCAhuMP2xE',
}

async function tvl() {
  const provider = getProvider()
  const connection = getConnection()
  const reserveInfo = {}
  for (const reserve of Object.values(reserves)) {
    const [info] = await connection.getMultipleAccountsInfo([new PublicKey(reserve)])
    const { info: { liquidity: { mintPubkey, marketPrice, }, collateral }} = decodeAccount('reserve', info)
    reserveInfo[collateral.mintPubkey.toString()] = { price: marketPrice/1e18, key: mintPubkey.toString(), }
  }
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const vaultTypes = await program.account.vaultType.all()
  const psmAccounts = await program.account.psmAccount.all()
  const tokensAndOwners = psmAccounts.map(i => [i.account.collateralMint.toString(), i.publicKey.toString()])
  let balances = {}
  vaultTypes.forEach(({ account }) => {
    let token = account.collateralMint.toString()
    let balance = +account.collateralHeld
    const { key, price} = reserveInfo[token] || {}
    if (key) {
      token = key
      balance = BigNumber(price * balance).toFixed(0)
    }
    sdk.util.sumSingleBalance(balances, 'solana:'+token, balance )
  })
  return sumTokens2({ balances, tokensAndOwners, })
}

async function staking() {
  const provider = getProvider()
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const stakingPools = await program.account.stakingPool.all()
  const balances = {}
  stakingPools.forEach(({ account, }) => {
    sdk.util.sumSingleBalance(balances, 'solana:'+account.stakedTokenMint.toString(), +account.deposits)
  })
  return balances
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking
  },
  methodology:
    "TVL is equal to the Collateral Value + assets in PSM. Staking adds Amount of HDG staked * HDG price"
};