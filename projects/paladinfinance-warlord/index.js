const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { BigNumber } = require("ethers");

const WAR_CONTROLLER = "0xFDeac9F9e4a5A7340Ac57B47C67d383fb4f13DBb";

async function getLockers(api) {
  let lockers = [];

  for (let i = 0; i != -1; ++i) {
    try {
      const output = await api.call({
        target: WAR_CONTROLLER,
        abi: abi["lockers"],
        params: [BigNumber.from(i)]
      })
      lockers.push(output);
    } catch(e) {
      break;
    }
  }

  return lockers;
}

async function ethTvl(timestamp, block, _, { api },) {
  const balances = {};

  const lockers = await getLockers(api);

  const bals = await api.multiCall({ abi: abi["getCurrentLockedTokens"], calls: lockers.map(i => ({ target: i})) })
  const tokens = await api.multiCall({ abi: abi["token"], calls:  lockers.map(i => ({ target: i})) })

  bals.forEach((v, i) => sdk.util.sumSingleBalance(balances, tokens[i], v))

  return balances;
}

module.exports = {
  methodology: "Counts the total locked tokens inside the lockers contracts",
  ethereum: {
    tvl: ethTvl,
  },
  start: 17368026
};
