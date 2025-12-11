// Pegged Asset Adapter for chUSD on Plasma chain
// This file should be placed in: src/adapters/peggedAssets/chusd/index.ts
// in the peggedassets-server repository

const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
  plasma: {
    issued: ["0x22222215d4edc5510d23d0886133e7ece7f5fdc1"], // chUSD contract address
  },
};

async function plasmaMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.plasma.issued[0],
        block: _chainBlocks?.plasma,
        chain: "plasma",
      })
    ).output;
    return { peggedUSD: totalSupply / 10 ** 18 };
  };
}

const adapter: PeggedIssuanceAdapter = {
  plasma: {
    minted: plasmaMinted(),
    unreleased: async () => ({}), // No unreleased tokens
  },
};

export default adapter;
