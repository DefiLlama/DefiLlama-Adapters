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

  const solendReserves = market.reserves;

  const marketConfigs = market.reserves
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

  const obligations = accounts
    .map((account) => parseObligation(account.pubkey, account.account))
    .map((o) => {
      const so = new SolendObligation(
        o?.account.owner!,
        o?.pubkey!,
        o?.info!,
        solendReserves
      );
      return {
        owner: o?.info.owner.toString(),
        borrows: so.borrows.map((b) => ({
          mintAddress: b.mintAddress,
          amount: b.amount.toString(),
        })),
        deposits: so.deposits.map((d) => ({
          mintAddress: d.mintAddress,
          amount: d.amount.toString(),
        })),
        ...so.obligationStats,
      };
    })
    .filter((o) => o.borrowUtilization < 1);

  console.log(
    obligations.find(
      (o) => o.owner === "3oSE9CtGMQeAdtkm2U3ENhEpkFMfvrckJMA8QwVsuRbE"
    )
  );
};

func();
