const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

// Peridot Finance — Compound V2 fork (pTokens + Peridottroller)
// Hub chains: BSC Mainnet (56) + Monad Mainnet (143)
//
// Note: totalBorrows() reverts in this pToken implementation.
// Borrowed amounts are derived via the Compound V2 accounting identity:
//   exchangeRateStored = (cash + totalBorrows - totalReserves) / totalSupply
//   => totalBorrows = (exchangeRateStored * totalSupply / 1e18) + totalReserves - cash

const config = {
  bsc: {
    comptroller:  "0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14",
    nativeMarket: "0xD9fDF5E2c7a2e7916E7f10Da276D95d4daC5a3c3", // pWBNB
  },
  monad: {
    comptroller:  "0x6D208789f0a978aF789A3C8Ba515749598940716",
    nativeMarket: "0x2FB2861402A22244464435773dd1C6951735CdF7", // pMON
  },
};

const ABIS = {
  getAllMarkets:       "function getAllMarkets() external view returns (address[])",
  underlying:         "function underlying() external view returns (address)",
  getCash:            "function getCash() external view returns (uint256)",
  totalSupply:        "function totalSupply() external view returns (uint256)",
  exchangeRateStored: "function exchangeRateStored() external view returns (uint256)",
  totalReserves:      "function totalReserves() external view returns (uint256)",
};

// Returns [{market, underlying}] for all markets in the comptroller.
// Native market gets nullAddress as underlying.
async function getMarketsData(api, comptroller, nativeMarket) {
  const markets = await api.call({ abi: ABIS.getAllMarkets, target: comptroller });

  const underlyings = await Promise.all(
    markets.map(async (market) => {
      if (market.toLowerCase() === nativeMarket.toLowerCase()) return nullAddress;
      try {
        return await api.call({ abi: ABIS.underlying, target: market });
      } catch (_) {
        return null; // skip broken/unlisted markets
      }
    })
  );

  return markets
    .map((market, i) => ({ market, underlying: underlyings[i] }))
    .filter(({ underlying }) => underlying !== null);
}

// TVL = balanceOf(underlying, pToken) for each market.
// For native markets this is eth_getBalance(pToken) — equivalent to getCash().
async function tvl(api) {
  const { comptroller, nativeMarket } = config[api.chain];
  const marketsData = await getMarketsData(api, comptroller, nativeMarket);
  const tokensAndOwners = marketsData.map(({ market, underlying }) => [underlying, market]);
  return sumTokens2({ api, tokensAndOwners });
}

// Borrowed = totalBorrows per market, computed from exchange rate identity.
async function borrowed(api) {
  const { comptroller, nativeMarket } = config[api.chain];
  const marketsData = await getMarketsData(api, comptroller, nativeMarket);

  await Promise.all(
    marketsData.map(async ({ market, underlying }) => {
      try {
        const [cash, supply, rate, reserves] = await Promise.all([
          api.call({ abi: ABIS.getCash,            target: market }),
          api.call({ abi: ABIS.totalSupply,        target: market }),
          api.call({ abi: ABIS.exchangeRateStored, target: market }),
          api.call({ abi: ABIS.totalReserves,      target: market }),
        ]);

        // All values come as strings from the SDK; use BigInt throughout.
        const cashB     = BigInt(cash);
        const supplyB   = BigInt(supply);
        const rateB     = BigInt(rate);
        const reservesB = BigInt(reserves);

        // exchangeRate mantissa is scaled by 1e18
        const totalBorrows = (rateB * supplyB) / (10n ** 18n) + reservesB - cashB;

        if (totalBorrows > 0n) {
          api.add(underlying, totalBorrows.toString());
        }
      } catch (_) {
        // skip markets with no activity or reverted calls
      }
    })
  );
}

module.exports = {
  methodology:
    "TVL is the sum of tokens held in each Peridot lending market (getCash equivalent). " +
    "Borrowed is derived via the Compound V2 exchange rate identity since totalBorrows() " +
    "is not directly callable in this pToken implementation.",
  bsc:   { tvl, borrowed },
  monad: { tvl, borrowed },
};
