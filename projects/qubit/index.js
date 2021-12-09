const sdk = require("@defillama/sdk");
const abi = require('./abi.json')

const qBnb = "0xbE1B5D17777565D67A5D2793f879aBF59Ae5D351"; // qBNB
const wBnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //wBNB
const qoreComptroller = "0xf70314eb9c7fe7d88e6af5aa7f898b3a162dcd48"

function tvl(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const chain = "bsc"
    const block = chainBlocks[chain]
    const balances = {};

    const qTokens = (await sdk.api.abi.call({
      target: qoreComptroller,
      block,
      chain,
      abi: abi.allMarkets
    })).output
    const [amounts, underlyings] = await Promise.all([borrowed?abi.totalBorrow: abi.getCash, abi.underlying].map(abi=>sdk.api.abi.multiCall({
      calls: qTokens.map(qt=>({target:qt})),
      abi,
      block,
      chain
    })))

    for (let i = 0; i < qTokens.length; i++) {
      const qtoken = qTokens[i]
      const amount = amounts.output[i].output
      const underlying = qtoken===qBnb?wBnb:underlyings.output[i].output
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${underlying}`,
        amount
      );
    }

    return balances;
  }
}

module.exports = {
  timetravel: true,
  doublecounted: false,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  bsc: {
    tvl: tvl(false),
    borrowed: tvl(true),
  },
};
