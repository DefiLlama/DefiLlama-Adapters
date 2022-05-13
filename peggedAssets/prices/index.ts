const sdk = require("@defillama/sdk");
import abi from "./abi.json";
import { ChainBlocks } from "../peggedAsset.type";

type ChainlinkFeeds = {
  [coinGeckoID: string]: {
    address: string;
    chain: string;
    decimals: number;
  };
};

const feeds: ChainlinkFeeds = {
  tether: {
    address: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
    chain: "ethereum",
    decimals: 8,
  }, // USDT-USD ETH
  "usd-coin": {
    address: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
    chain: "ethereum",
    decimals: 8,
  }, // USDC-USD ETH
  terrausd: {
    address: "0x8b6d9085f310396C6E4f0012783E9f850eaa8a82",
    chain: "ethereum",
    decimals: 8,
  }, // UST-USD ETH
  "binance-usd": {
    address: "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
    chain: "ethereum",
    decimals: 8,
  }, // BUSD-USD ETH
  dai: {
    address: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
    chain: "ethereum",
    decimals: 8,
  }, // DAI-USD ETH
  frax: {
    address: "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
    chain: "ethereum",
    decimals: 8,
  }, // FRAX-USD ETH
  "true-usd": {
    address: "0xec746eCF986E2927Abd291a2A1716c940100f8Ba",
    chain: "ethereum",
    decimals: 8,
  }, // TUSD-USD ETH
};

export default async function getCurrentPeggedPrice(
  token: string,
  chainBlocks: ChainBlocks
): Promise<Number> {
  const feed = feeds[token];
  const latestRound = await sdk.api.abi.call({
    abi: abi.latestRoundData,
    target: feed.address,
    block: chainBlocks[feed.chain],
    chain: feed.chain,
  });

  return latestRound.output.answer / 10 ** feed.decimals;
}
