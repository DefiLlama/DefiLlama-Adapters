const { sumTokens2 } = require("../helper/unwrapLPs");

const swapFlashLoans = Object.values({
  'BP1': "0x4bcb9Ea3dACb8FfE623317E0B102393A3976053C",
  'BP2': "0x6a63cbf00D15137756189c29496B14998b259254",
  'BP3': "0xE7E1b1F216d81a4b2c018657f26Eda8FE2F91e26",
  'BP4': "0xeC938Bc5b201E96b6AFE97070a8Ea967E0dcAe96"
})

async function tvl(api) {
  const tokens = await api.multiCall({  abi: 'address[]:getTokens', calls: swapFlashLoans})
  const ownerTokens = tokens.map((token, idx) => [token, swapFlashLoans[idx]])
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  core: {
    tvl
  },
  methodology: "Counts all BTC-pegged tokens in the Bitflux liquidity pools"
}