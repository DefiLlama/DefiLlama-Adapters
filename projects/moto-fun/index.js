const ADDRESSES = require('../helper/coreAssets.json')

// moto.fun, the token launchpad of Motoswap, on Ethereum mainnet (live since 2026-09-28).
// One contract, the LaunchpadCurve (UUPS proxy), holds every coin's bonding curve and the ETH it has raised.
// Fees are paid out on every trade (protocol leg to the Motoswap fee collector, creator leg to the creator fee vault),
// so the curve's native balance is the sum of the ETH reserves of the coins still on their curves.
// At graduation the ETH moves into Motoswap pairs with the LP burned; that liquidity is counted in the Motoswap adapter.

const CURVE = '0xb65b67e986d7B097652920d72202F2c78319BC2C'

async function tvl(api) {
  return api.sumTokens({ owner: CURVE, tokens: [ADDRESSES.null] })
}

module.exports = {
  methodology:
    'TVL is the ETH held by the moto.fun bonding curve contract for coins that have not graduated yet. ' +
    'Graduated coins trade on Motoswap pairs, which are counted in the Motoswap adapter.',
  start: '2026-09-28', // curve deployed at block 26075451 (2026-09-28 10:47 UTC); earlier blocks read 0 ETH
  ethereum: { tvl },
}
