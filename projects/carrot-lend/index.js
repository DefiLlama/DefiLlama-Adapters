const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");
const { wrappedI80F48toNumber } = require("./utils/conversion")

const programId = 'C73nDAFn23RYwiFa6vtHshSbcg8x6BLYjw3bERJ3vHxf'


async function tvl() {
  const provider = getProvider();
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const banks = await program.account.bank.all()

  return sumTokens2({ 
    tokenAccounts: banks.map(i => i.account.liquidityVault.toString()),
  });
}

async function borrowed(api) {
  const provider = getProvider();
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const banks = await program.account.bank.all()


  for (const bank of banks) {
    const totalLiabilityShares = wrappedI80F48toNumber(bank.account.totalLiabilityShares)
    const liabilityShareValue = wrappedI80F48toNumber(bank.account.liabilityShareValue)

    api.add(bank.account.mint.toString(), liabilityShareValue * totalLiabilityShares);
    
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL consists of deposits made to the protocol, and borrowed tokens are counted.',
  solana: { tvl, borrowed },
}
