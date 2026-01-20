const { Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");
const idl = require('./idl.json')
const wrappedI80F48toBigNumber = require("./utils/conversion")

let _banks

async function getBanks() {
  if (_banks) return _banks
  const provider = getProvider('eclipse')
  const program = new Program(idl, provider)
  _banks = program.account.bank.all()
  return _banks
}

async function tvl(api) {
  const banks = await getBanks()
  return sumTokens2({ api, tokenAccounts: banks.map(bank => bank.account.liquidityVault) });
}

async function borrowed(api) {
  const banks = await getBanks()

  banks.forEach(bank => {
    api.add(bank.account.mint.toString(), wrappedI80F48toBigNumber(bank.account.totalLiabilityShares.value))
  })
}

module.exports = {
  timetravel: false,
  eclipse: { tvl, borrowed, },
}
