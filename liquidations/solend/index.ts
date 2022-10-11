import { PublicKey, Connection } from "@solana/web3.js";
import { SolendMarket, SolendObligation, parseObligation } from "@solendprotocol/solend-sdk";
import { BigNumber } from "bignumber.js";
import { Liq } from "../utils/types";

const endpoint = process.env.SOLANA_RPC || "https://solana-api.projectserum.com/"; // or "https://api.mainnet-beta.solana.com"
const connection = new Connection(endpoint, "confirmed");

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

const INSPECTOR_BASE_URL = "https://solend.fi/dashboard?wallet=";

const liquidations = async () => {
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

  const tokenInfosMap: Map<string, MarketConfig> = new Map(marketConfigs.map((c) => [c.mintAddress, c]));

  const accounts = await connection.getProgramAccounts(new PublicKey(SOLEND_PROGRAM_ID), {
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
  });

  const obligations = accounts
    .map((account) => parseObligation(account.pubkey, account.account))
    .map((o) => {
      if (!o) return null;

      const so = new SolendObligation(o?.account.owner!, o?.pubkey!, o?.info!, solendReserves);
      return {
        owner: o?.info.owner.toString(),
        borrows: so.borrows.map((b) => ({
          mintAddress: b.mintAddress,
          amount: b.amount.toString(),
          token: tokenInfosMap.get(b.mintAddress)!,
        })),
        deposits: so.deposits.map((d) => ({
          mintAddress: d.mintAddress,
          amount: d.amount.toString(),
          token: tokenInfosMap.get(d.mintAddress)!,
        })),
        ...so.obligationStats,
      };
    })
    .filter((o) => o !== null)
    .filter((o) => o!.borrowUtilization < 1);

  const positions = obligations.flatMap((o) => {
    if (!o) return [];
    // true decimals in USD, not wad etc
    const { owner, liquidationThreshold, userTotalBorrow } = o;

    const liquidablePositions = o.deposits
      .map((d) => {
        const token = tokenInfosMap.get(d.mintAddress)!;
        const { decimals, assetPriceUSD } = token;
        const amount = new BigNumber(d.amount).div(10 ** decimals); // real decimal

        const oldTokenValue = new BigNumber(token.assetPriceUSD!).times(amount);

        const liqPrice = new BigNumber(userTotalBorrow)
          .minus(liquidationThreshold)
          .div(token.liquidationThreshold!) // ratio here
          .plus(oldTokenValue)
          .div(amount)
          .toNumber();

        return {
          owner,
          liqPrice,
          collateral: "solana:" + d.mintAddress,
          collateralAmount: d.amount,
          assetPriceUSD,
        };
      })
      .filter((p) => p.liqPrice > 0 && p.liqPrice < p.assetPriceUSD!)
      .map(
        ({ owner, liqPrice, collateral, collateralAmount }) =>
          ({
            owner,
            liqPrice,
            collateral,
            collateralAmount,
            extra: {
              url: INSPECTOR_BASE_URL + owner,
            },
          } as Liq)
      );

    return liquidablePositions;
  });

  return positions;
};

module.exports = {
  solana: {
    liquidations,
  },
};
