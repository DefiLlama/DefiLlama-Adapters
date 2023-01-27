import axios from "axios";
import { Liq } from "./types";

export const TOTAL_BINS = 20;

export interface Bins {
  [token: string]: {
    bins: {
      [bin: number]: number;
    };
    binSize: number;
    price: number;
  };
}

export async function binResults(liqs: Liq[]) {
  const tokens = new Set<string>();
  liqs.map((liq) => tokens.add(liq.collateral.toLowerCase()));
  const prices = (await axios.get("https://coins.llama.fi/prices/current/" + Array.from(tokens).join(","))).data
    .coins as {
    [address: string]: { decimals: number; price: number; symbol: string; timestamp: number };
  };
  // coins api doesn't support decimals for coingecko keys
  if (prices["coingecko:tezos"]) {
    prices["coingecko:tezos"].decimals = 6;
  }
  console.log(prices);
  const bins = Object.values(prices).reduce(
    (all, token) => ({
      ...all,
      [token!.symbol]: {
        bins: {},
        binSize: token.price / TOTAL_BINS,
        price: token.price,
      },
    }),
    {} as Bins
  );
  const skippedTokens = new Set<string>();
  liqs.map((liq) => {
    const tokenAddress = liq.collateral.toLowerCase();
    const token = prices[tokenAddress];
    if (token === undefined) {
      skippedTokens.add(tokenAddress);
      return;
    }
    const binSize = bins[token.symbol].binSize;
    const bin = Math.floor(liq.liqPrice / binSize);
    if (bins[token.symbol].bins[bin] === undefined) {
      bins[token.symbol].bins[bin] = 0;
    }
    bins[token.symbol].bins[bin] += Number(liq.collateralAmount) / 10 ** token.decimals;
  });
  return { skippedTokens, bins };
}
