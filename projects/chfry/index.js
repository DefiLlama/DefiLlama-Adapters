const fryerContracts = [
  "0xd1ffa2cbAE34FF85CeFecdAb0b33E7B1DC19024b",
  "0x87F6fAA87358B628498E8DCD4E30b0378fEaFD07",
  "0x7E271Eb034dFc47B041ADf74b24Fb88E687abA9C",
]


async function tvl(api) {
  const token = await api.multiCall({ abi: 'address:token', calls: fryerContracts })
  const bals = await api.multiCall({ abi: "uint256:totalDeposited", calls: fryerContracts })
  api.add(token, bals)
}

module.exports = {
  methodology: "TVL is being calculated as the total amount deposited in the lending protocol by users.",
  ethereum: {
    tvl,
  },
}
