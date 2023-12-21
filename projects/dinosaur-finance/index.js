const sdk = require('@defillama/sdk')

const vaults = [
  "0xd93567C2634e907c1AA0D91A6d514dFf0491e0dC",
  "0x75b44D326fDfFe3889f9B26d166DF44E938824ce",
  "0x1A53a7C19b29df3e94c0559Ea41BDF5A8e9A88DD",
]

async function tvl(_, _b, _c, { api }) {
  const balances = {}

  const tokens = await api.multiCall({ abi: "uint256:balance", calls: vaults, })
  const lps = await api.multiCall({ abi: "address:want", calls: vaults, })

  tokens.forEach((data, i) => {
    sdk.util.sumSingleBalance(balances, lps[i], data, api.chain)
  })

  return balances

}

module.exports = {
  hallmarks: [
    [1675814400, "Rug Pull"]
  ],
  arbitrum: {
    tvl,
  }
}

