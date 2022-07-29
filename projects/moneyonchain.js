// Money on Chain exists on the RSK chain
// Based on four tokens:
// The DoC, a USD price pegged Stablecoin token.
// The BPro (Bitpro) a token designed for BTC hodlers, to earn a rent on Bitcoin and gain free leverage.
// The BTCx, a token that represents a leveraged long bitcoin holding position.
// The MoC token, designed to govern a decentralized autonomous organization (DAO) that will govern the Smart Contracts.


// Various API endpoints: https://api.moneyonchain.com/api/report/

// stats from https://moneyonchain.com/stats/
const sdk = require('@defillama/sdk')

async function tvl(_, _b, { rsk: block }) {
  const docCollateral = '0xf773b590af754d597770937fa8ea7abdf2668370'
  const { output } = await sdk.api.eth.getBalances({
    targets: [docCollateral],
    chain: 'rsk', block,
  });
  let total = 0
  output.forEach(i => total += i.balance/1e18)
  return {
    'rootstock': total
  }
}

module.exports = {
  timetravel: false,
  rsk: {
    tvl,
  }
}