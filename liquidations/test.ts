import * as path from "path";
import * as fs from "fs";
import { ethers } from "ethers";
import { providers } from "./utils/ethers";
import { util } from "@defillama/sdk";
import { TOTAL_BINS, Bins, binResults } from "./utils/binResults";
import { Liq } from "./utils/types";
import { config } from "dotenv";
import { performance } from "perf_hooks";

config();

const f2 = (n: number) => Number(n.toFixed(2));

async function displayDebugInfo(skippedTokens: Set<string>, liqs: Liq[], bins: Bins) {
  let sumLiquidable = 0;
  const liquidableTable = [] as any[];
  Object.entries(bins).map(([symbol, tokenLiqs]) => {
    console.log(`${symbol} (current price: ${tokenLiqs.price})`);
    const max = Object.values(tokenLiqs.bins).reduce((max, bin) => Math.max(max, bin), 0);
    for (let i = 0; i < TOTAL_BINS; i++) {
      const amountInBin = tokenLiqs.bins[i] ?? 0;
      const range = (n: number) => (tokenLiqs.binSize * n).toFixed(2);
      console.log(
        `${"#".repeat((amountInBin / max) * 10).padEnd(10)} = ${range(i)}-${range(i + 1)} = ${amountInBin.toFixed(2)}`
      );
    }
    let sumInside = 0;
    let sumOutside = 0;
    Object.entries(tokenLiqs.bins).map(([i, amount]) => {
      if (Number(i) < TOTAL_BINS) {
        sumInside += amount;
      } else {
        sumOutside += amount;
      }
    });
    if (sumOutside > 0) {
      const percentLiquidable = (100 * sumOutside) / (sumInside + sumOutside);
      const liquidable = tokenLiqs.price * sumOutside;
      sumLiquidable += liquidable;
      liquidableTable.push({
        symbol,
        percentLiquidable: f2(percentLiquidable),
        totalLiquidableTokens: f2(sumOutside),
        totalLiquidableUSD: liquidable,
      });
    }
    console.log("");
  });
  const skippedTable = await Promise.all(
    Array.from(skippedTokens).map(async (tokenAddress) => {
      const [chain, address] = tokenAddress.split(":");
      if (chain.toLowerCase() === "solana") {
        return {
          symbol: "UNKNOWN",
          address: tokenAddress,
        };
      }

      const tokenContract = new ethers.Contract(address, ["function symbol() view returns (string)"], providers[chain]);
      let symbol: string;
      try {
        symbol = await tokenContract.symbol();
      } catch (e) {
        symbol = "UNKNOWN";
      }
      return {
        symbol,
        address: tokenAddress,
      };
    })
  );
  if (skippedTable.length > 0) {
    console.log(`The following tokens couldn't be priced and have been skipped:`);
    console.table(skippedTable);
  }
  if (sumLiquidable > 0) {
    console.log("\nLiquidable positions:");
    console.table(
      liquidableTable
        .sort((a, b) => b.totalLiquidableUSD - a.totalLiquidableUSD)
        .concat([
          {
            symbol: "Total",
            percentLiquidable: "-",
            totalLiquidableTokens: "-",
            totalLiquidableUSD: sumLiquidable,
          },
        ])
        .map((o) => ({
          ...o,
          totalLiquidableUSD: util.humanizeNumber.humanizeNumber(o.totalLiquidableUSD),
        }))
    );
    console.log("If this number is high double check your data!");
  }
  console.log(liqs);
}

async function main() {
  const passedFile = path.resolve(process.cwd(), process.argv[2]);
  let module = {} as {
    [chain: string]: { liquidations: () => Promise<Liq[]> };
  };
  try {
    module = require(passedFile);
  } catch (e) {
    console.log(e);
  }

  const startTime = performance.now();
  const liqs = (await Promise.all(Object.values(module).map((m) => m.liquidations()))).flat();
  const endTime = performance.now();

  // // write liqs to disk as JSON
  // fs.writeFileSync(path.resolve(process.cwd(), "liquidations2.json"), JSON.stringify(liqs, null, 2));

  const { skippedTokens, bins } = await binResults(liqs);
  await displayDebugInfo(skippedTokens, liqs, bins);
  //console.log(liqs)
  console.log(`\nSize of all liquidation data: ${JSON.stringify(liqs).length / 10 ** 6} MB`);
  console.log(`Took ${f2((endTime - startTime) / 1000)} seconds to fetch liquidations`);
  process.exit(0);
}
main();
