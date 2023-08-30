
const contracts = [
  "0x2F123cF3F37CE3328CC9B5b8415f9EC5109b45e7", // bC3M
  "0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5", // b1B01
  "0x52d134c6DB5889FaD3542A09eAf7Aa90C0fdf9E4", // bIBTA
  "0x1e2c4fb7ede391d116e6b41cd0608260e8801d59", // bCSPX
  "0x20C64dEE8FdA5269A78f2D5BDBa861CA1d83DF7a", // bHIGH
]

async function tvl(_, _b, _cb, { api, }) {
  const supply = await api.multiCall({ abi: 'erc20:totalSupply', calls: contracts })
  api.addTokens(contracts, supply)

}

module.exports = {
  ethereum: {
    tvl
  }
}