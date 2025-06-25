const ADDRESSES = require('../helper/coreAssets.json')
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

// TODO: Find a dynamic way to obtain this mapping
const TOKEN_MINT_TO_TOKEN2022_MINT = {
  [ADDRESSES.solana.SOL]: ADDRESSES.solana.SOL,
  '8gEs8igcTdyrKzvEQh3oPpZm4HqNYozyczBCPQmZrsyp': 'GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn',
  '7rCPN5Lcaxomf92ssF4M9dd8FVMoM43NLsWZyMd6DpNp': ADDRESSES.eclipse.WIF,
  '7mZCsut9beY53V9VWWovrRTBurGv6dozAmuhbwbyHsqk': ADDRESSES.eclipse.SOL,
  'Hke78vy1Mzzt5eEJ2jMeKtdqddedDe2rmzjsq16p9ETW': ADDRESSES.eclipse.USDC,
};

async function eclipseTvl(api) {
  const balances = await sumTokens2({ api, owners: ['5Gk1kTdDqqacmA2UF3UbNhM7eEhVFvF3p8nd9p3HbXxk'] });

  const token2022MappedBalances = {};
  for (const [key, value] of Object.entries(balances)) {
    const token = key.split(':')[1];
    if (TOKEN_MINT_TO_TOKEN2022_MINT[token]) {
      token2022MappedBalances[`eclipse:${TOKEN_MINT_TO_TOKEN2022_MINT[token]}`] = value;
    } else {
      token2022MappedBalances[key] = value;
    }
  }

  return token2022MappedBalances;
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

