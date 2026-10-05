const { getTezosBalance } = require('../helper/chain/tezos')

const wtzContracts = [
  "KT1BB3oNr5vUSw1CuPNb2zpYEVp376XrXWaJ",
  "KT1H25LW5k4HQGm9hmNXzaxf3nqjsAEhQPah",
  "KT1LpGZnT6dj6STSxHXmvSPqx39ZdPXAMpFz",
  "KT1NBgqqJacbdoeNAg9MvrgPT9h6q6AGWvFA",
  "KT1NGTDBKDPMrAYEufb72CLwuQJ7jU7jL6jD",
]

async function tvl() {
  let tezos = 0
  for (const contract of wtzContracts)
    tezos += await getTezosBalance(contract)
  return { tezos }
}

module.exports = {
  deadFrom: "2026-01-01", // abandoned
  timetravel: false,
  tezos: {
    tvl
  }
}
