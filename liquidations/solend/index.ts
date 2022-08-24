import { PublicKey, Connection } from "@solana/web3.js";
import { BN } from "bn.js";
import {
  SolendMarket,
  SolendObligation,
  parseObligation,
} from "@solendprotocol/solend-sdk";
import { BigNumber } from "bignumber.js";

const connection = new Connection("https://solend.genesysgo.net/", "confirmed");

const SOLEND_PROGRAM_ID = "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo";
const LENDING_MARKET_MAIN = "4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY";
const OBLIGATION_LEN = 1300;

type MarketConfig = {
  name: string;
  symbol: string;
  mintAddress: string;
  reserveAddress: string;
  decimals: number;
  cTokenExchangeRate?: number;
  loanToValueRatio?: number;
  liquidationThreshold?: number; // safe to
  assetPriceUSD?: number;
};

type ExtendedPosition = {
  mintAddress: string;
  amount: string;
  token: MarketConfig;
};

const func = async () => {
  const market = await SolendMarket.initialize(connection);
  await market.loadReserves();

  const solendReserves = market.reserves;

  const marketConfigs: MarketConfig[] = market.reserves
    .map((r) => ({
      ...r.config,
      ...r.stats,
    }))
    .map((c) => ({
      name: c.name,
      symbol: c.symbol,
      loanToValueRatio: c.loanToValueRatio, // collateralFactor
      assetPriceUSD: c.assetPriceUSD, // underlyingPriceUSD
      mintAddress: c.mintAddress, // underlyingAddress
      cTokenExchangeRate: c.cTokenExchangeRate, // exchangeRate
      decimals: c.decimals, // underlyingDecimals
      liquidationThreshold: c.liquidationThreshold,
      reserveAddress: c.address, // reserve address
    }));

  const marketConfigsMap: Map<
    string, // reserve address
    MarketConfig
  > = new Map(marketConfigs.map((c) => [c.reserveAddress, c]));

  const tokenInfosMap: Map<string, MarketConfig> = new Map(
    marketConfigs.map((c) => [c.mintAddress, c])
  );

  console.log(marketConfigsMap);

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
          token: tokenInfosMap.get(b.mintAddress),
        })),
        deposits: so.deposits.map((d) => ({
          mintAddress: d.mintAddress,
          amount: d.amount.toString(),
          token: tokenInfosMap.get(d.mintAddress),
        })),
        ...so.obligationStats,
      };
    })
    .filter((o) => o.borrowUtilization < 1);

  const positions = obligations.map((o) => {
    const { userTotalBorrow, userTotalDeposit } = o; // true decimals in USD, not wad etc

    const tokens = new Map<
      string,
      // TODO: no need for array cuz u cant have 2 borrow positions ova same token
      // will refactor later
      { borrows: ExtendedPosition[]; deposits: ExtendedPosition[] }
    >();

    o.borrows.forEach((b) => {
      const token = b.token!;
      const tokenBorrows = tokens.get(token.mintAddress) || {
        borrows: [],
        deposits: [],
      };
      tokenBorrows.borrows.push({
        mintAddress: b.mintAddress,
        amount: b.amount,
        token,
      });
      tokens.set(token.mintAddress, tokenBorrows);
    });

    o.deposits.forEach((d) => {
      const token = d.token!;
      const tokenDeposits = tokens.get(token.mintAddress) || {
        borrows: [],
        deposits: [],
      };
      tokenDeposits.deposits.push({
        mintAddress: d.mintAddress,
        amount: d.amount,
        token,
      });
      tokens.set(token.mintAddress, tokenDeposits);
    });

    const aggregatedDebts = new Map<string, string>(); // mintAddress, amount
    for (const token of tokens) {
      const { borrows, deposits } = token[1];
      const borrowsTotal = borrows.reduce(
        (acc, b) => acc.plus(new BigNumber(b.amount).negated()),
        new BigNumber(0)
      );
      const depositsTotal = deposits.reduce(
        (acc, d) => acc.plus(new BigNumber(d.amount)),
        new BigNumber(0)
      );
      const total = borrowsTotal.plus(depositsTotal);
      aggregatedDebts.set(token[0], total.toString());
    }

    for (const aggregatedDebt of aggregatedDebts) {
      const [mintAddress, amount] = aggregatedDebt;
      const token = tokenInfosMap.get(mintAddress)!;
      const { name, symbol, decimals } = token;
      const amountInUSD = new BigNumber(amount).dividedBy(10 ** decimals);
      console.log(
        `${name} (${symbol}) - ${amountInUSD.toFixed(2)} USD - ${amount} wad`
      );
    }
  });

  const target = obligations.find(
    (o) => o.owner === "3oSE9CtGMQeAdtkm2U3ENhEpkFMfvrckJMA8QwVsuRbE"
  );

  const liquidables = target;

  console.log(liquidables);
};

func();
