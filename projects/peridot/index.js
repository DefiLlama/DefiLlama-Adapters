const { compoundExports } = require("../helper/compound");
const { nullAddress } = require("../helper/unwrapLPs");
const abi = require("../helper/abis/compound.json");

// Helper function to get markets (same logic as compound helper)
async function getMarkets(comptroller, api, cether, cetheEquivalent, blacklistedTokens, abis) {
  if (cether) {
    if (!Array.isArray(cether)) cether = [cether];
    cether = new Set(cether.map(i => i.toLowerCase()));
  }
  const blacklistSet = new Set([...blacklistedTokens].map(i => i.toLowerCase()));
  const cTokens = (await api.call({ abi: abis.getAllMarkets, target: comptroller })).map(i => i.toLowerCase());
  const underlyings = await api.multiCall({ abi: abi.underlying, calls: cTokens, permitFailure: true });

  const markets = [];
  underlyings.forEach((underlying, i) => {
    const cToken = cTokens[i];
    if (cether?.has(cToken)) underlying = cetheEquivalent;
    if (blacklistSet.has(cToken)) return;
    if (underlying) markets.push({ cToken, underlying });
    else throw new Error(`Market rugged, is that market CETH? ${cToken}`);
  });
  return markets;
}

// Custom TVL function that calculates total supplied as getCash() + totalBorrows()
function getCompoundTvlWithBorrows(comptroller, cether, cetheEquivalent, { blacklistedTokens = [], abis = {} } = {}) {
  abis = { ...abi, ...abis };
  return async (api) => {
    const markets = await getMarkets(comptroller, api, cether, cetheEquivalent, blacklistedTokens, abis);
    const cTokens = markets.map(market => market.cToken);
    const tokens = markets.map(market => market.underlying);

    // Get both getCash() and totalBorrows() for each market
    const cash = await api.multiCall({ calls: cTokens, abi: abis.getCash });
    const borrows = await api.multiCall({ calls: cTokens, abi: abis.totalBorrows });

    // Add getCash + totalBorrows for each token (total supplied)
    tokens.forEach((token, i) => {
      const totalSupplied = (BigInt(cash[i] || 0) + BigInt(borrows[i] || 0)).toString();
      api.add(token, totalSupplied);
    });

    blacklistedTokens.forEach(token => api.removeTokenBalance(token));

    return api.getBalances();
  };
}

const bscCompound = compoundExports(
  "0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14", // Comptroller
  "0xD9fDF5E2c7a2e7916E7f10Da276D95d4daC5a3c3", // pWBNB (native market)
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // WBNB (underlying for native)
);

const monadCompound = compoundExports(
  "0x6D208789f0a978aF789A3C8Ba515749598940716", // Comptroller
  "0x2FB2861402A22244464435773dd1C6951735CdF7", // pMON (native market)
  nullAddress, // Native token underlying (nullAddress = 0x0000...)
  { blacklistedTokens: ["0xf8255935e62aa000c89de46a97d2f00bfff147e7"] } // Blacklist market without underlying
);

module.exports = {
  timetravel: true,
  methodology:
    "TVL is calculated by summing getCash() and totalBorrows() for all markets in the Peridot lending protocol, representing total supplied tokens. Borrowed balances are also tracked separately.",
  bsc: {
    tvl: getCompoundTvlWithBorrows(
      "0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14", // Comptroller
      "0xD9fDF5E2c7a2e7916E7f10Da276D95d4daC5a3c3", // pWBNB (native market)
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB (underlying for native)
      {}
    ),
    borrowed: bscCompound.borrowed,
  },
  monad: {
    tvl: getCompoundTvlWithBorrows(
      "0x6D208789f0a978aF789A3C8Ba515749598940716", // Comptroller
      "0x2FB2861402A22244464435773dd1C6951735CdF7", // pMON (native market)
      nullAddress, // Native token underlying (nullAddress = 0x0000...)
      { blacklistedTokens: ["0xf8255935e62aa000c89de46a97d2f00bfff147e7"] } // Blacklist market without underlying
    ),
    borrowed: monadCompound.borrowed,
  },
};
