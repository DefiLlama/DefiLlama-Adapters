/**
 * Oswap is a decentralized token swap protocol on the Obyte ledger.
 *
 * @see https://oswap.io/
 */
const { fetchBaseAATvl } = require('../helper/obyte')

async function totalTvl(timestamp) {
  return Promise.all([
      fetchBaseAATvl(timestamp, "GS23D3GQNNMNJ5TL4Z5PINZ5626WASMA"), // Oswap v1
      fetchBaseAATvl(timestamp, "2JYYNOSRFGLI3TBI4FVSE6GFBUAZTTI3"), // Oswap v2
      fetchBaseAATvl(timestamp, "DYZOJKX4MJOQRAUPX7K6WCEV5STMKOHI")  // Oswap v2
    ]).then( values => {
      return values.reduce( (total, tvl) => total + tvl, 0)
  })
}

module.exports = {
  timetravel: true,
  doublecounted: false,
  methodology:
    "The TVL is the USD value of the total native asset (bytes) locked into the autonomous agents extending the Oswap protocol (v1, v2 and v3). " +
    "The value of other assets listed in Oswap are not part of this TVL because they are either assets without established value " +
    "other protocol tokens such as algorithmic stable coins (Ostable) or imported tokens from other chains (CounterStake bridge).",
  obyte: {
    fetch: totalTvl
  },
  fetch: totalTvl
}
