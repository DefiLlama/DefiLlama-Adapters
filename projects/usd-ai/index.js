const USDai = "0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF"

const chains = ["arbitrum", "plasma", "base"]

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is calculated as the total supply of USDai on each supported chain. " +
    "USDai is a synthetic dollar backed by tokenized U.S. Treasuries and loans against GPU/AI compute hardware. " +
    "sUSDai (staked USDai) is not counted separately as the underlying USDai remains in total supply. " +
    "Yield is generated from real-world GPU hardware deals (NVIDIA B300, GB300, RTX 6000, B200) " +
    "deployed across data centers globally, plus a PYUSD incentive program.",
}

const tvl = async (api) => {
  const supply = await api.call({ target: USDai, abi: "erc20:totalSupply" })
  api.add(USDai, supply)
}

chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})
