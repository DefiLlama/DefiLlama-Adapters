const { Program } = require("@project-serum/anchor");
const { sumTokens2, getProvider, } = require("../helper/solana");

const programId = '5TeGDBaMNPc2uxvx6YLDycsoxFnBuqierPt3a8Bk4xFX'

async function tvl() {
  const provider = getProvider()
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const assetsList = await program.account.assetsList.all()
  const state = await program.account.state.all()
  const owners = state.map(i => i.account.exchangeAuthority.toString())
  const tokens = []
  assetsList.forEach(list => {
    const { headCollaterals, collaterals } = list.account
    for (let i = 0; i < headCollaterals; i++)
      tokens.push(collaterals[i].collateralAddress.toString())
  })
  return sumTokens2({ tokens, owners, })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology:
    'To obtain TVL of Synthetify we must add all colaterals which was deposited.'
}
