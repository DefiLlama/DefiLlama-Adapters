// Pegged Asset Adapter for chUSD on Plasma chain (SHORTHAND VERSION)
// This file should be placed in: src/adapters/peggedAssets/chusd/index.ts
// in the peggedassets-server repository

const chainContracts = {
  plasma: {
    issued: ["0x22222215d4edc5510d23d0886133e7ece7f5fdc1"], // chUSD contract address
  },
};

import { addChainExports } from "../helper/getSupply";

// This assumes pegType to be peggedUSD and 18 decimals
const adapter = addChainExports(chainContracts);

export default adapter;
