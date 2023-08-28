const { getProvider, getSolBalance, } = require("./helper/solana")
const { Program, } = require("@project-serum/anchor");

async function tvl() {
  const provider = getProvider()
  const programId = 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const [
    {
      account: {
        validatorSystem: { totalActiveBalance },
        availableReserveBalance,
      },
    },
  ] = await program.account.state.all()
  return {
    solana:
      (+totalActiveBalance +
        +availableReserveBalance +
        (await getSolBalance("UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q"))) / // Liq Pool Sol Leg Pda
      1e9,
  }
}

module.exports = {
    hallmarks:[
        [1667865600, "FTX collapse"]
    ],
    timetravel: false,
    solana: { tvl },
    methodology: `We sum the amount of SOL staked, SOL in reserve address: Du3Ysj1wKbxPKkuPPnvzQLQh8oMSVifs3jGZjJWXFmHN and SOL in the Liquidity pool: UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q`,
}
