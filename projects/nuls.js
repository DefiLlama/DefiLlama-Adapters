const utils = require('./helper/utils')

const url = "https://public1.nuls.io/nuls/tvl"

const tvl = async (api) => {
  const { data } = await utils.fetchURL(url)
  if (data.tvl > 10_000_000) throw new Error("abnormally high TVL")
  return api.addUSDValue(Math.floor(data.tvl))
}

module.exports={
  misrepresentedTokens: true,
  methodology: 'TVL counts native chain staking and data is pulled from: "https://public1.nuls.io/nuls/tvl".',
  nuls: { tvl }
}