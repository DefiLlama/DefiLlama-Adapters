const { Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");
const { sumTokens2: sumTokensEVM } = require("../helper/unwrapLPs");

const programId = '82WgTNpTgAV383UB4FemgviZQSaEQ4YuipRy1QHVMWgt'


async function tvl(api) {
  const provider = getProvider("eclipse")
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)

  // Get all vaults and PSM accounts
  const psmAccounts = await program.account.psmAccount.all()

  const tokensAndOwners = psmAccounts.map(i => [
    i.account.collateralMint.toString(),
    i.publicKey.toString()
  ])

  // Get all vault types to map collateral mints
  const vaultTypes = await program.account.vaultType.all()
  vaultTypes.forEach(({ account }) => {
    let token = account.collateralMint.toString()
    let balance = +account.collateralHeld
    api.add(token, balance)
  })

  await sumTokens2({ api, tokensAndOwners })
  return sumTokensEVM({ api })
}

async function staking(api) {
  const provider = getProvider("eclipse")
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)
  const stakingPools = await program.account.stakingPool.all()
  stakingPools.forEach(({ account, }) => {
    api.add(account.stakedTokenMint.toString(), account.deposits)
  })

  return sumTokensEVM({ api })
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