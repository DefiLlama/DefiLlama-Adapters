const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");
const { sumBalancerLps, unwrapCrv } = require("../helper/unwrapLPs.js");
const { transformArbitrumAddress } = require("../helper/portedTokens");

const Collaterals = {
  ETH: "0x0000000000000000000000000000000000000000",
  wBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"//
}

const TROVE_MANAGER_ADDRESS = "0x99838142189adE67c1951f9c57c3333281334F7F"; // deposits in native ETH and wBTC
const STABILITY_POOL_ETH_ADDRESS = "0x6a9f9d6F5D672a9784c5E560a9648de6cbe2c548"; // deposits in DCHF
const STABILITY_POOL_WBTCADDRESS = "0x04556d845f12Ff7D8Ff04a37F40387Dd1B454c4b"; // deposits in DCHF
const MON_STAKING_POOL = "0x8Bc3702c35D33E5DF7cb0F06cb72a0c34Ae0C56F"; // deposits DCHF

const DCHF_TOKEN = "0x045da4bFe02B320f4403674B3b7d121737727A36";
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
    tvl
  },
  start: 1664074800,
  timetravel: true,
  methodology:
    "Total deposits of ETH and wBTC for borrowed DCHF, Collateral Stability Pools and Moneta Staking Pool ",
};