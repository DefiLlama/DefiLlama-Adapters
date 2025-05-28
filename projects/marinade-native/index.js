const { getStakedSol } = require('../helper/solana')

async function tvl(api) {
  await getStakedSol('stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq', api)
}

module.exports = {
  solana: { tvl }
}