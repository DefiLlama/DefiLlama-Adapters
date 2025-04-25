const { sumTokens2, sumTokensExport } = require("../helper/unwrapLPs")

const chainVaults = {
  flare: {
    cysflr: {
        start: 34244389, // cysflr deployement block
        owner: "0x19831cfB53A0dbeAD9866C43557C1D48DfF76567", // cysflr
        token: "0x12e605bc104e93B45e1aD99F9e555f659051c2BB", // sflr
    },
    cyweth: {
        start: 36028901, // cyweth deployement block
        owner: "0xd8BF1d2720E9fFD01a2F9A2eFc3E101a05B852b4", // cyweth
        token: "0x1502FA4be69d526124D453619276FacCab275d3D", // weth
    },
  },
}

async function tvl(api) {
  const vaults = chainVaults[api.chain]
  const tokensAndOwners = Object.values(vaults).map((v) => [v.token, v.owner]);
  return sumTokens2({ api, tokensAndOwners, fetchCoValentTokens: true, permitFailure: true })
}

module.exports = {
  methodology: 'Total value locked in Cyclo vaults.',
}

Object.keys(chainVaults).forEach(chain => {
  module.exports[chain] = { tvl }
})
