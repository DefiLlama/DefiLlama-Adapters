const newPool = "0x6eC088B454d2dB7a2d8879A25d9ce015039E30FB"
const hegic = "0x584bC13c7D411c00c01A62e8019472dE68768430"

async function tvl(api) {
  const bal = await api.call({ abi: "uint256:totalUnderlying", target: newPool })
  api.add(hegic, bal)
}

module.exports = {
  ethereum: {
    tvl
  },
}
