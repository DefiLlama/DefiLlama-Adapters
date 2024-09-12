const { sumTokens2 } = require("../helper/unwrapLPs")

async function tvl(api) {
  const pool = await api.call({ target: '0x831fc32221924f8a6d47251327ef67ebcc5cd6dc', abi: "address:mutuariPool" })
  const tokens = await api.call({ target: pool, abi: "address[]:getReserves" })
  return sumTokens2({ api, owner: pool, tokens,})
}
async function borrowed(api) {
  const [_, borrowed] = await api.call({ target: '0x831fc32221924f8a6d47251327ef67ebcc5cd6dc', abi: "function getGeneralInfo() view returns (uint256 totalSupplied, uint256 totalBorrowed)" })
  api.addGasToken(borrowed)
  return sumTokens2({ api })
}

module.exports = {
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.",
  ftn: { tvl, borrowed },
}
