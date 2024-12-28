const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

const DAOvault = Object.values({
  Elon: "0x2D9a136cF87D599628BCBDfB6C4fe75Acd2A0aA8",
  Cuban: "0x2AD9F8d4c24652Ea9F8A954F7E1FdB50a3bE1DFD",
  Citadel: "0x8fE826cC1225B03Aa06477Ad5AF745aEd5FE7066",
  // FAANG: "0x9ee54014e1E6CF10fD7E9290FdB6101fd0d5D416",
  // Metaverse: "0x5b3ae8b672a753906b1592d44741f71fbd05ba8c",
})

async function tvl(api) {
  const bals = await api.multiCall({ abi: "uint256:getAllPoolInUSD", calls: DAOvault })
  const bals2 = await api.call({ abi: "function getAllPoolInUSD(bool) view returns (uint256)", target: '0x5b3ae8b672a753906b1592d44741f71fbd05ba8c', params: true })
  api.add(ADDRESSES.ethereum.USDT, bals)
  api.add(ADDRESSES.ethereum.USDT, bals2 / 1e12)
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    staking: staking("0x1193c036833B0010fF80a3617BBC94400A284338", "0x77dce26c03a9b833fc2d7c31c22da4f42e9d9582"),
  },
}