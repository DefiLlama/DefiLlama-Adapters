
const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2,  } = require("./helper/solana");

async function tvl() {
  const provider = getProvider()
  const idl = await Program.fetchIdl('HajXYaDXmohtq2ZxZ6QVNEpqNn1T53Zc9FnR1CnaNnUf', provider)
  const program = new Program(idl, 'HajXYaDXmohtq2ZxZ6QVNEpqNn1T53Zc9FnR1CnaNnUf', provider)
  const pools = await program.account.vaultType.all()
  return sumTokens2({ tokenAccounts: pools.map(i => i.account.collateralTokenHolder.toString()), blacklistedTokens: ['PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44'], })
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking: async () => sumTokens2({ tokenAccounts: ['CJM5Un8AhMgLJv2mcj3o5z2z8H3deDzLA1TH7E3WhZQG']})  },
}
