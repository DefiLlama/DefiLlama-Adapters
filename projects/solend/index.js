const { sumTokens2, decodeAccount, getMultipleAccounts, } = require("../helper/solana");
const { getConfig } = require('../helper/cache')

const solendConfigEndpoint = "https://api.solend.fi/v1/markets/configs?scope=all&deployment=production";

async function borrowed(api) {
  const markets = (await getConfig('solend', solendConfigEndpoint))
  const reserves = []

  for (const market of markets)
    for (const reserve of market.reserves)
      reserves.push(reserve.address)

  const infos = await getMultipleAccounts(reserves)
  infos.forEach(i => {
    const { info: { liquidity } } = decodeAccount('reserve', i)
    const amount = liquidity.borrowedAmountWads.toString() / 1e18
    api.add(liquidity.mintPubkey.toString(), amount)
  })
}

async function tvl() {
  const markets = (await getConfig('solend', solendConfigEndpoint))
  return sumTokens2({ owners: markets.map(i => i.authorityAddress) });
}

async function eclipseTvl(api) {
  return sumTokens2({ api, owners: ['5Gk1kTdDqqacmA2UF3UbNhM7eEhVFvF3p8nd9p3HbXxk'] });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  eclipse: { tvl: eclipseTvl },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
  hallmarks: [
    [1635940800, "SLND launch"],
    [1667826000, "FTX collapse, SOL whale liquidated"],
  ],
};

