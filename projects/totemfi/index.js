const { get } = require('../helper/http')
const { sumTokens } = require('../helper/unwrapLPs');
const poolsURL = 'https://new-offchain.totemfi.com/api/v1/pool/?order=desc&order_field=maturity_date&page=0&limit=99&schedule=&filter=network%7Cbsc%7C%3D%3B'
const TOTM = "0x6FF1BFa14A57594a5874B37ff6AC5efbD9F9599A"

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks["bsc"];
  let balances = {};
  const { pools } = await get(poolsURL)
  const tokensAndOwners = pools
    .filter(pool => pool.poolCreatedEvent)
    .map(pool => [TOTM, pool.poolCreatedEvent.Pool])
  await sumTokens(balances, tokensAndOwners, block, 'bsc')
  return balances
}


module.exports = {
  bsc: {
    tvl,
  }
}