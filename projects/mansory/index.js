const { getTokenSupplies, sumTokens2 } = require("../helper/solana")

const MNSRY_SOL = '1xdtu7y3LkkrVCAbm5KGKfYzq1qgKhxxk5AaJBqpump'
const owner_OFT = '8nULvjDGGykWnwd6mogRm9i7Y5D5M47S2YNwZrPf8bUN'
const MNSRY_BSC = '0x0fCfE33b46E5B21e5E96B722d4c85510198F9255'

async function getCirculatingSupply({ token, exclude = [] }) {
  const [walletBalances, supplies] = await Promise.all([
    sumTokens2({ owners: exclude, tokens: [token] }),
    getTokenSupplies([token]),
  ])

  const totalSupply = supplies[token]
  const excluded = walletBalances['solana:' + token]

  return totalSupply - excluded
}

const sol_tvl = async (api) => {
  const supply = await getCirculatingSupply({ token: MNSRY_SOL, exclude: [owner_OFT] })
  api.add(MNSRY_SOL, supply)
}

const bsc_tvl = async (api) => {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: MNSRY_BSC })
  api.add(MNSRY_BSC, supply)
}

module.exports = {
  solana: { tvl: sol_tvl },
  bsc: { tvl: bsc_tvl }
}