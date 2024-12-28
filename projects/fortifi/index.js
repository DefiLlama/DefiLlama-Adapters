const { nullAddress } = require("../helper/tokenMapping")

const vaults = [
  '0x432963C721599Cd039ff610Fad447D487380D858', // FortiFi AVAX Stability Vault (ffAvaSV)
  '0x853e7A9dcc5037cD624834DC5f33151AA49d2D73', // FortiFi WAVAX LST MultiYield (ffWavaxLST)
]

const abi = {
  getTokenInfo: "function getTokenInfo(uint256 _tokenId) view returns ((uint256 deposit, ((address strategy, address depositToken, address router, address oracle, bool isFortiFi, bool isSAMS, uint16 bps, uint8 decimals) strategy, uint256 receipt)[] positions))",
}

async function tvl(api) {
  for (const vault of vaults) {
    const token = await api.call({ abi: 'address:depositToken', target: vault }).catch(() => nullAddress)
    const data = await api.fetchList({ lengthAbi: 'nextToken', itemAbi: abi.getTokenInfo, target: vault })
    api.add(token, data.map(d => d.deposit))
  }
}

module.exports = {
  avax: {
    tvl,
  },
}