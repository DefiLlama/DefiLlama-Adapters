const {Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const programId = '82WgTNpTgAV383UB4FemgviZQSaEQ4YuipRy1QHVMWgt'


async function tvl(api) {
  const provider = getProvider("eclipse")
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)

  // Get all vaults and PSM accounts
  const vaults = await program.account.vault.all()
  const psmAccounts = await program.account.psmAccount.all()

  const tokensAndOwners = psmAccounts.map(i => [
    i.account.collateralMint.toString(),
    i.publicKey.toString()
  ])

  const reserveInfo = {}
  // Get all vault types to map collateral mints
  const vaultTypes = await program.account.vaultType.all()
  let balances = {}
    vaultTypes.forEach(({ account }) => {
      let token = account.collateralMint.toString()
      let balance = +account.collateralHeld
      const { key, price} = reserveInfo[token] || {}
      if (key) {
        token = key
        balance = BigNumber(price * balance).toFixed(0)
      }
      sdk.util.sumSingleBalance(balances, 'eclipse:'+token, balance )
    })

  return sumTokens2({ balances, tokensAndOwners })
}

async function staking(api) {
  const provider = getProvider("eclipse")
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)
  const stakingPools = await program.account.stakingPool.all()
  const balances = {}
  stakingPools.forEach(({ account, }) => {
    sdk.util.sumSingleBalance(balances, 'eclipse:'+account.stakedTokenMint.toString(), +account.deposits)
  })
  
  return balances
}
module.exports = {
    timetravel: false,
    eclipse: {
      tvl,
      staking,
    },
    methodology:
      "TVL is equal to the Collateral Value + assets in PSM. Staking adds Amount of NPT staked * NPT price"
  };