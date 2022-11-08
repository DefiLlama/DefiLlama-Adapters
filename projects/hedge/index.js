const { getProvider, sumTokens2, } = require("../helper/solana");
const { Program, } = require("@project-serum/anchor");
const sdk = require('@defillama/sdk')

const programId = 'HedgeEohwU6RqokrvPU4Hb6XKPub8NuKbnPmY7FoMMtN'

async function tvl() {
  const provider = getProvider()
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const vaultTypes = await program.account.vaultType.all()
  const psmAccounts = await program.account.psmAccount.all()
  const tokensAndOwners = psmAccounts.map(i => [i.account.collateralMint.toString(), i.publicKey.toString()])
  const balances = {}
  vaultTypes.forEach(({ account }) => {
    sdk.util.sumSingleBalance(balances, 'solana:'+account.collateralMint.toString(), +account.collateralHeld)
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