const { getProvider, sumTokens2, } = require("./helper/solana")
const { Program, } = require("@project-serum/anchor");
const ADDRESSES = require('./helper/coreAssets.json')

async function tvl() {
  const provider = getProvider()
  const programId = 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const [{
    account: {
      validatorSystem: { totalActiveBalance },
      availableReserveBalance,
      emergencyCoolingDown,
    },
  },] = await program.account.state.all()
  
  const balances = {
    [ADDRESSES.solana.SOL]: +totalActiveBalance + +availableReserveBalance + +emergencyCoolingDown
  }
  
  return sumTokens2({ balances, solOwners: ['UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q'] }) // Liq Pool Sol Leg Pda
}

module.exports = {
  hallmarks: [
    [1667865600, "FTX collapse"]
  ],
  timetravel: false,
  solana: { tvl },
  methodology: `We sum the amount of SOL staked, SOL in reserve address: Du3Ysj1wKbxPKkuPPnvzQLQh8oMSVifs3jGZjJWXFmHN, SOL in the Liquidity pool: UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q, and the emergency cooling down balance.`,
}