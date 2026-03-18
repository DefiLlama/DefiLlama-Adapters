const { nullAddress } = require("../helper/unwrapLPs");

// Peridot Finance — Compound V2 fork (pTokens + Peridottroller)
// Chains: BSC (56) + Monad (143)
//
// totalBorrows() reverts in Peridot's pToken implementation.
// We derive it via the Compound V2 accounting identity:
//   exchangeRateStored = (cash + borrows - reserves) / totalSupply
//   => borrows = (exchangeRateStored * totalSupply / 1e18) + reserves - cash
//
// TVL uses getCash() directly (avoids sumTokens2 native-token query issues).

const config = {
  bsc: {
    comptroller: "0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14",
    nativeMarket: "0xD9fDF5E2c7a2e7916E7f10Da276D95d4daC5a3c3", // pBNB
    blacklistedMarkets: [],
  },
  monad: {
    comptroller: "0x6D208789f0a978aF789A3C8Ba515749598940716",
    nativeMarket: "0x2FB2861402A22244464435773dd1C6951735CdF7", // pMON
    blacklistedMarkets: ["0xf8255935e62aa000c89de46a97d2f00bfff147e7"],
  },
};

const ABIS = {
  getAllMarkets:      "function getAllMarkets() external view returns (address[])",
  underlying:        "function underlying() external view returns (address)",
  getCash:           "function getCash() external view returns (uint256)",
  totalSupply:       "function totalSupply() external view returns (uint256)",
  exchangeRateStored:"function exchangeRateStored() external view returns (uint256)",
  totalReserves:     "function totalReserves() external view returns (uint256)",
};

async function getMarketsData(api, { comptroller, nativeMarket, blacklistedMarkets }) {
  const markets = await api.call({ abi: ABIS.getAllMarkets, target: comptroller });
  const blacklistSet = new Set(blacklistedMarkets.map((m) => m.toLowerCase()));

  const filtered = markets.filter((m) => !blacklistSet.has(m.toLowerCase()));

  const underlyings = await Promise.all(
    filtered.map(async (market) => {
      if (market.toLowerCase() === nativeMarket.toLowerCase()) return nullAddress;
      try {
        return await api.call({ abi: ABIS.underlying, target: market });
      } catch {
        return null; // skip markets with no underlying (broken/unlisted)
      }
    })
  );

  return filtered
    .map((market, i) => ({ market, underlying: underlyings[i] }))
    .filter(({ underlying }) => underlying !== null);
}

// TVL = getCash() per market (available liquidity, not borrowed out)
async function tvl(api) {
  const marketsData = await getMarketsData(api, config[api.chain]);

  await Promise.all(
    marketsData.map(async ({ market, underlying }) => {
      try {
        const cash = await api.call({ abi: ABIS.getCash, target: market });
        api.add(underlying, cash);
      } catch {
        // skip markets with no liquidity or reverted calls
      }
    })
  );
}

// Borrowed = totalBorrows per market, derived from exchange rate identity.
async function borrowed(api) {
  const marketsData = await getMarketsData(api, config[api.chain]);

  await Promise.all(
    marketsData.map(async ({ market, underlying }) => {
      try {
        const [cash, supply, rate, reserves] = await Promise.all([
          api.call({ abi: ABIS.getCash,            target: market }),
          api.call({ abi: ABIS.totalSupply,        target: market }),
          api.call({ abi: ABIS.exchangeRateStored, target: market }),
          api.call({ abi: ABIS.totalReserves,      target: market }),
        ]);

        // exchangeRate mantissa is 1e18; use BigInt to avoid float precision issues
        const totalBorrows =
          (BigInt(rate) * BigInt(supply)) / (10n ** 18n) +
          BigInt(reserves) -
          BigInt(cash);

        if (totalBorrows > 0n) {
          api.add(underlying, totalBorrows.toString());
        }
      } catch {
        // skip markets with no activity or reverted calls
      }
    })
  );
}

module.exports = {
  methodology:
    "TVL is the sum of getCash() across all Peridot lending markets (available liquidity). " +
    "Borrowed is derived via the Compound V2 exchange rate identity since totalBorrows() " +
    "reverts in this pToken implementation.",
  bsc:   { tvl, borrowed },
  monad: { tvl, borrowed },
};
