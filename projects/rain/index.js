const { Program } = require("@project-serum/anchor");
const { getProvider } = require("../helper/solana");
const idl = require('./idl')

async function tvl(api) {
  const provider = getProvider()
  const rainProgram = new Program(idl, 'RainEraPU5yDoJmTrHdYynK9739GkEfDsE4ffqce2BR', provider)
  const tokenizerProgram = new Program(idl, 'RtokEFPPbXqDrzAHJHt16fwN6hZmepfPpSvW7y47g5r', provider)

  const pools = await rainProgram.account.pool.all()
  const assetManagers = await tokenizerProgram.account.assetManager.all()

  for (const assetManager of assetManagers) {
    api.add(assetManager.account.currencyIn.toString(), assetManager.account.currentAmountTokenized)
  }

  for (const pool of pools)
    api.add(pool.account.currency.toString(), pool.account.availableAmount)
}

async function borrowed(api) {
  const provider = getProvider()
  const program = new Program(idl, 'RainEraPU5yDoJmTrHdYynK9739GkEfDsE4ffqce2BR', provider)
  const pools = await program.account.pool.all()

  for (const pool of pools)
    api.add(pool.account.currency.toString(), pool.account.borrowedAmount)
}

module.exports = {
  solana: { tvl, borrowed, },
}