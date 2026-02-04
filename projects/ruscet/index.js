const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const contractId = '0x8002f2e86302ef9421558d0ae25a68cdfdbec5d27915cc2db49eded220799ecc'
  return sumTokens({ api, owner: contractId })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}
