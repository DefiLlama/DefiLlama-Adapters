const ADDRESSES = require('../helper/coreAssets.json')

// UTY is XSY's dollar unit and TVL is its circulating supply.
//
// It is booked at its peg rather than through the token, because the UTY price
// feed stopped on 2026-08-04 and coins.llama.fi now returns an empty `coins`
// object for it. An unpriced token contributes nothing, so `api.add` published a
// flat $0 from 08-05 onwards against a live 20.99M supply.
//
// The peg is the assumption here and it is stated rather than hidden: every one of
// the 88 quotes the feed did publish, 2026-04-23 through 2026-08-04, sat between
// 0.99892 and 0.99953, a 0.06% band. The token is still live (supply steady at
// 20.99M, transfers of 215k and 700k UTY on 2026-08-17). If UTY ever breaks its
// peg this overstates TVL, and it should go back to pricing the token the moment
// the feed returns.
async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: ADDRESSES.avax.UTY,
  })
  api.addUSDValue(totalSupply / 1e18)
}

module.exports = {
  start: 58017291, // block when UTY contract was deployed
  methodology: 'Circulating supply of UTY, counted at its dollar peg.',
  avax: { tvl },
}
