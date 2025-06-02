const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const methodologies = require('../helper/methodologies');

const qBnb = "0xbE1B5D17777565D67A5D2793f879aBF59Ae5D351"; // qBNB
const wBnb = ADDRESSES.bsc.WBNB; //wBNB
const qoreComptroller = "0xf70314eb9c7fe7d88e6af5aa7f898b3a162dcd48";

const dashboardKlaytn = "0x9A47D707FDffC561E3598990f25d3874af448568";
const qTokensKlaytn = [
  "0xf6FB6Ce9dcc5Dac5BE99503B44630FfF1f24b1EC", // qKLAY
  "0xE61688286f169A88189E6Fbe5478B5164723B14A", // qKUSDT
  "0xb3e0030557CeC1CEf43062F71c2bE3b5f92f1B7b", // qKETH
  "0x19e1e58d9EdFdDc35D11bEa53BCcf8Eb1425Bf0D", // qKWBTC
  "0x0EaAAEB0623f6E263d020390e01d00a334EB531E", // QKDAI
  "0xC1c3a6b591a493c01B1330ee744d2aF01F70EA32", // QKSP
  "0x99dac5dF97eB189Cd244c5bfC8984f916f0eb4B0", // qWEMIX
  "0x3dB032090A06e3dEaC905543C0AcC92B8f827a70", // qKQBT
];

function tvl(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const chain = "bsc";
    const block = chainBlocks[chain];
    const balances = {};

    const qTokens = (
      await sdk.api.abi.call({
        target: qoreComptroller,
        block,
        chain,
        abi: abi.allMarkets,
      })
    ).output;
    const [amounts, underlyings] = await Promise.all(
      [borrowed ? abi.totalBorrow : abi.getCash, abi.underlying].map((abi) =>
        sdk.api.abi.multiCall({
          calls: qTokens.map((qt) => ({ target: qt })),
          abi,
          block,
          chain,
        })
      )
    );

    for (let i = 0; i < qTokens.length; i++) {
      const qtoken = qTokens[i];
      const amount = amounts.output[i].output;
      const underlying = qtoken === qBnb ? wBnb : underlyings.output[i].output;
      sdk.util.sumSingleBalance(balances, `bsc:${underlying}`, amount);
    }

    return balances;
  };
}

function tvlKlaytn() {
  return async (timestamp, ethBlock, chainBlocks) => {
    const chain = "klaytn";
    const block = chainBlocks[chain];

    const data = await sdk.api.abi.call({
      target: dashboardKlaytn,
      block,
      chain,
      abi: abi.totalValueLockedOf,
      params: [qTokensKlaytn],
    });

    return {
      tether: data.output/ 1e18,
    };
  };
}

module.exports = {
  hallmarks: [
    [1643241600, "tokenAddress hack"]
],
      methodology: methodologies.lendingMarket,
  bsc: {
    tvl: tvl(false),
    //borrowed: tvl(true), // hacked
  },
  klaytn: {
    // no borrowed: Dashboard contract of Qubit returns 'supply - borrow' value
    tvl: tvlKlaytn(),
  },
};
