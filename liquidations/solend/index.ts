import { PublicKey, Connection } from "@solana/web3.js";
import { BN } from "bn.js";
import {
  SolendMarket,
  SolendObligation,
  parseObligation,
} from "@solendprotocol/solend-sdk";

const connection = new Connection("https://solend.genesysgo.net/", "confirmed");

const SOLEND_PROGRAM_ID = "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo";
const LENDING_MARKET_MAIN = "4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY";
const OBLIGATION_LEN = 1300;

const func = async (): Promise<void> => {
  const market = await SolendMarket.initialize(connection);
  await market.loadReserves();

  const marketConfigs = market.reserves
    // .map((r) => r.stats?.loanToValueRatio)
    .map((r) => ({ ...r.config, ltv: r.stats?.loanToValueRatio }))
    .map((c) => ({
      name: c.name,
      symbol: c.symbol,
      collateral: c.mintAddress, // token address
      reserveAddress: c.address, // reserve address
      decimals: c.decimals,
      ltv: c.ltv,
    }));

  const marketConfigsMap: Map<
    string, // reserve address
    {
      name: string;
      symbol: string;
      collateral: string;
      reserveAddress: string;
      decimals: number;
      ltv?: number;
    }
  > = new Map(marketConfigs.map((c) => [c.reserveAddress, c]));

  // console.log(marketConfigsMap); // mintAddress issa token address

  const accounts = await connection.getProgramAccounts(
    new PublicKey(SOLEND_PROGRAM_ID),
    {
      commitment: connection.commitment,
      filters: [
        {
          memcmp: {
            offset: 10,
            bytes: LENDING_MARKET_MAIN,
          },
        },
        {
          dataSize: OBLIGATION_LEN,
        },
      ],
      encoding: "base64",
    }
  );
  console.log("Number of users:", accounts.length);

  const obligations = accounts
    .map((account) => parseObligation(account.pubkey, account.account))
    .map((x) => x?.info)
    .filter(
      (x) =>
        x?.borrowedValue.gt(new BN(0)) &&
        x?.depositedValue.gt(x?.borrowedValue) &&
        x?.deposits.length! > 0 &&
        x?.borrows.length! > 0 // rough filter for undercollateralized positions/bad debts
    )
    .map((x) => {
      return {
        owner: x?.owner.toString(),
        lendingMarket: x?.lendingMarket.toString(),
        deposits: x?.deposits.map((d) => {
          const token = marketConfigsMap.get(d.depositReserve.toString());
          return {
            depositReserve: d.depositReserve.toString(),
            depositedAmount: d.depositedAmount.toString(),
            marketValue: d.marketValue.toString(),
            name: token?.name,
            depositTokenAddress: token?.collateral,
            depositTokenSymbol: token?.symbol,
            depositTokenDecimals: token?.decimals,
          };
        }),
        depositedValue: x?.depositedValue.toString(),
        borrows: x?.borrows.map((b) => {
          const token = marketConfigsMap.get(b.borrowReserve.toString());
          return {
            borrowReserve: b.borrowReserve.toString(),
            borrowedAmount: b.borrowedAmountWads.toString(),
            cumulativeBorrowRateWads: b.cumulativeBorrowRateWads.toString(),
            marketValue: b.marketValue.toString(),
            name: token?.name,
            depositTokenAddress: token?.collateral,
            depositTokenSymbol: token?.symbol,
            depositTokenDecimals: token?.decimals,
          };
        }),
        borrowedValue: x?.borrowedValue.toString(),
      };
    });

  console.log("Number of users in market:", obligations.length);
  console.log(
    obligations.find(
      (x) => x.owner === "3oSE9CtGMQeAdtkm2U3ENhEpkFMfvrckJMA8QwVsuRbE" // an example user witha lotta monies
    )
  );
  // {
  //   owner: '3oSE9CtGMQeAdtkm2U3ENhEpkFMfvrckJMA8QwVsuRbE',
  //   lendingMarket: '4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY',
  //   deposits: [
  //     {
  //       depositReserve: '8PbodeaosQP19SjYFx855UMqWxH2HynZLdBXmsrbac36',
  //       depositedAmount: '2567490723574012',
  //       marketValue: '102678618022093413665770808',
  //       name: 'Wrapped SOL',
  //       depositTokenAddress: 'So11111111111111111111111111111111111111112',
  //       depositTokenSymbol: 'SOL',
  //       depositTokenDecimals: 9
  //     }
  //   ],
  //   depositedValue: '102678618022093413665770808',
  //   borrows: [
  //     {
  //       borrowReserve: '8K9WC8xoh2rtQNY7iEGXtPvfbDCi563SdWhCAhuMP2xE',
  //       borrowedAmount: '499346690573971950934099',
  //       cumulativeBorrowRateWads: '1072543202579825630',
  //       marketValue: '499471532240082349',
  //       name: 'USDT',
  //       depositTokenAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  //       depositTokenSymbol: 'USDT',
  //       depositTokenDecimals: 6
  //     },
  //     {
  //       borrowReserve: 'BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw',
  //       borrowedAmount: '49063935343190918904363735020628',
  //       cumulativeBorrowRateWads: '1070781113684550885',
  //       marketValue: '49066388539958078450308953',
  //       name: 'USD Coin',
  //       depositTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  //       depositTokenSymbol: 'USDC',
  //       depositTokenDecimals: 6
  //     }
  //   ],
  //   borrowedValue: '49066389039429610690391302'
  // }
};

func();
