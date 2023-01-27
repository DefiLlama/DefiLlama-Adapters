import BigNumber from "bignumber.js";
import { ConversionUtils } from "@hover-labs/kolibri-js";
import { Liq } from "../utils/types";
import axios from "axios";

/*
Credits goes to: https://github.com/Hover-Labs/kolibri-js/blob/master/src/oven-client.ts
As the vast majority of helpers from here were either took, modified or inspired from kolibri-js module
*/

export const TEZOS_RPC = process.env.TEZOS_RPC || "https://rpc.tzkt.io/mainnet";
export const OVEN_DATA_BASE_URL =
  "https://kolibri-data.s3.amazonaws.com/mainnet/oven-data.json";

const MUTEZ_DIGITS = 6;
const SHARD_DIGITS = 18;

export const MUTEZ_TO_SHARD = new BigNumber(
  Math.pow(10, SHARD_DIGITS - MUTEZ_DIGITS)
);

export const SHARD_PRECISION = new BigNumber(Math.pow(10, SHARD_DIGITS));

export interface KolibriOven {
  ovenAddress: string;
  ovenOwner: string;
  baker: string;
  balance: string;
  borrowedTokens: string;
  stabilityFees: string;
  isLiquidated: boolean;
  outstandingTokens: string;
}

const liquidatablePrice = (rate: BigNumber, price: BigNumber) => {
  const t = 1 - rate.toNumber();
  const a = price.dividedBy(Math.pow(10, 6));
  return a.minus(a.times(t));
};

export const customGetCollateralUtilization = (
  price: BigNumber,
  balance: BigNumber,
  outstandingTokens: BigNumber
) => {
  const priceShard = price.multipliedBy(MUTEZ_TO_SHARD);
  const collateralValue = balance
    .multipliedBy(MUTEZ_TO_SHARD)
    .multipliedBy(priceShard)
    .dividedBy(SHARD_PRECISION);

  return new BigNumber(
    outstandingTokens
      .times(Math.pow(10, SHARD_DIGITS))
      .dividedBy(collateralValue)
      .toFixed(0)
  );
};

export const getOvens = async (ovenBaseUrl) => {
  const {
    data: { allOvenData },
  } = await axios.get(ovenBaseUrl);

  //remvoving liquidated + empty ovens
  return (allOvenData as KolibriOven[]).filter(
    (oven) => oven.isLiquidated === false && parseInt(oven.balance, 10) > 0
  );
};

export const mapOven = async (
  { balance, ovenAddress, ovenOwner, outstandingTokens }: KolibriOven,
  price: BigNumber
) => {
  const ovenBalance = new BigNumber(balance);
  const collateralUtilization = customGetCollateralUtilization(
    price,
    ovenBalance,
    new BigNumber(outstandingTokens)
  );
  const rate = collateralUtilization.multipliedBy(2);
  const liquidatablePriceValue = liquidatablePrice(rate, price);

  return {
    owner: ovenOwner,
    liqPrice: parseFloat(
      ConversionUtils.shardToHumanReadableNumber(liquidatablePriceValue)
    ),
    collateral: `coingecko:tezos`,
    collateralAmount: ovenBalance.toString(),
    extra: {
      url: `https://tzkt.io/${ovenAddress}/operations/`,
      owner: `https://tzkt.io/${ovenOwner}/operations/`,
    },
  } as Liq;
};
