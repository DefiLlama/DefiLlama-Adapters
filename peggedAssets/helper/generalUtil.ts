import { BigNumber } from "ethers";
import type {
  Balances,
  PeggedAssetType,
  ChainBlocks,
} from "../peggedAsset.type";

export function sumSingleBalance(
  balances: Balances,
  pegType: PeggedAssetType,
  balance: string | number
) {
  if (typeof balance === "number") {
    const prevBalance = balances[pegType] ?? 0;
    if (typeof prevBalance !== "number") {
      throw new Error(
        `Trying to merge string and number token balances for balance ${balance}`
      );
    }
    (balances[pegType] as number) = prevBalance + balance;
  } else {
    const prevBalance = BigNumber.from(balances[pegType] ?? "0");
    balances[pegType] = prevBalance.add(BigNumber.from(balance)).toString();
  }
}

export async function multiFunctionBalance(
  functions: Promise<
    (
      timestamp: number,
      ethBlock: number,
      chainBlocks: ChainBlocks
    ) => Promise<Balances>
  >[],
  pegType: PeggedAssetType
) {
  return async function (
    timestamp: number,
    ethBlock: number,
    chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let fnPromise of functions) {
      const fn = await fnPromise;
      const balance = await fn(timestamp, ethBlock, chainBlocks);
      sumSingleBalance(balances, pegType, balance[pegType]);
    }
    return balances;
  };
}

