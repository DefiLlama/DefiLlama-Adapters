const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");
const { staking } = require('../helper/staking')

const Collaterals = {
  ETH: "0x0000000000000000000000000000000000000000",
  wBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"//
}

const TROVE_MANAGER_ADDRESS = "0x99838142189adE67c1951f9c57c3333281334F7F"; // deposits in native ETH and wBTC
const MON_STAKING_POOL = "0x8Bc3702c35D33E5DF7cb0F06cb72a0c34Ae0C56F"; // deposits DCHF

const MON_TOKEN = "0x1EA48B9965bb5086F3b468E50ED93888a661fc17";

async function tvl(_, block, chainBlocks) {
  block = chainBlocks.ethereum;
  const balances = {}
  const calls = Object.values(Collaterals).map(token => ({ params: [token] }))
  const { output } = await sdk.api.abi.multiCall({
    calls, block, chain: 'ethereum', target: TROVE_MANAGER_ADDRESS, abi: getEntireSystemCollAbi,
  })

  output.forEach(({ input: { params: [token] }, output }) => {
    if (token.toLowerCase() === '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599') // Fix wBTC balance
      output /= 1e10
    sdk.util.sumSingleBalance(balances, token, output)
  })

  return balances;
};

module.exports = {
  ethereum: {
    tvl,
    staking: staking(MON_STAKING_POOL, MON_TOKEN),
  },
  start: 1664074800,
  timetravel: true,
  methodology:
    "Total deposits of ETH and wBTC for borrowed DCHF.",
};