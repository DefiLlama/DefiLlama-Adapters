const sdk = require("@defillama/sdk");
import { multiFunctionBalance, sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  solanaMintedOrBridged,
  osmosisSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    bridgedFromTerra6Decimals: ["0xa693B19d2931d498c5B318dF961919BB4aee87a5"], // wormhole
    bridgedFromTerra18Decimals: ["0xa47c8bf37f92abed4a126bda807a7b7498661acd"], // shuttle
  },
  bsc: {
    bridgedFromTerra6Decimals: ["0x3d4350cD54aeF9f9b2C29435e0fa809957B3F30a"], // wormhole
    bridgedFromTerra18Decimals: ["0x23396cF899Ca06c4472205fC903bDB4de249D6fC"], // shuttle
  },
  harmony: {
    bridgedFromTerra: ["0x224e64ec1bdce3870a6a6c777edd450454068fec"], // shuttle
  },
  polygon: {
    bridgedFromTerra6Decimals: [
      "0xE6469Ba6D2fD6130788E0eA9C0a0515900563b59", // wormhole
      "0xeddc6ede8f3af9b4971e1fa9639314905458be87", // axelar
    ],
    bridgedFromTerra18Decimals: ["0x692597b009d13c4049a947cab2239b7d6517875f"], // shuttle?
  },
  solana: {
    bridgedFromTerra: [
      "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i", // wormhole
      "CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm", // wormhole v1
      "A96PoNcxa9LMxcF9HhKAfA1p3M1dGbubPMWf19gHAkgJ", // allbridge
    ],
  },
  fantom: {
    bridgedFromTerra: [
      "0xe2d27f06f63d98b8e11b38b5b08a75d0c8dd62b9", // multichain
      "0x846e4D51d7E2043C1a87E0Ab7490B93FB940357b", // wormhole
      "0x2b9d3f168905067d88d93f094c938bacee02b0cb", // axelar
    ],
  },
  aurora: {
    bridgedFromTerra: ["0x5ce9f0b6afb36135b5ddbf11705ceb65e634a9dc"], // allbridge
  },
  avax: {
    bridgedFromTerra: [
      "0xb599c3590F42f8F995ECfa0f85D2980B76862fc1", // wormhole
      "0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11", // axelar
    ],
  },
  moonbeam: {
    bridgedFromTerra: ["0x085416975fe14C2A731a97eC38B9bF8135231F62"], // axelar
  },
  oasis: {
    bridgedFromTerra: ["0xa1E73c01E0cF7930F5e91CB291031739FE5Ad6C2"], // wormhole
  },
  celo: {
    bridgedFromTerra: ["0xEd193C4E69F591E42398eF54DEa65aa1bb02835c"], // allbridge
  },
  fuse: {
    bridgedFromTerra: ["0x0D58a44be3dCA0aB449965dcc2c46932547Fea2f"], // allbridge
  },
};

/*
Aurora: can't find wormhole ust contract.

Sora: can't find API query to get info.

Solana: don't know whether to include Soluna or not JAa3gQySiTi8tH3dpkvgztJWHQC1vGXr5m6SQ9LEM55T
*/

async function terraMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://api.extraterrestrial.money/v1/api/supply?denom=uusd"
        )
    );
    const totalSupply = res.data.uusd[0].total;
    sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** 6);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  terra: {
    minted: terraMinted(),
    unreleased: async () => ({}),
  },
  ethereum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: multiFunctionBalance(
      [
        bridgedSupply(
          "ethereum",
          6,
          chainContracts.ethereum.bridgedFromTerra6Decimals
        ),
        bridgedSupply(
          "ethereum",
          18,
          chainContracts.ethereum.bridgedFromTerra18Decimals
        ),
      ],
      "peggedUSD"
    ),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: multiFunctionBalance(
      [
        bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromTerra6Decimals),
        bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromTerra18Decimals),
      ],
      "peggedUSD"
    ),
  },
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromTerra
    ),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: multiFunctionBalance(
      [
        bridgedSupply(
          "polygon",
          6,
          chainContracts.polygon.bridgedFromTerra6Decimals
        ),
        bridgedSupply(
          "polygon",
          18,
          chainContracts.polygon.bridgedFromTerra18Decimals
        ),
      ],
      "peggedUSD"
    ),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: solanaMintedOrBridged(chainContracts.solana.bridgedFromTerra),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply("fantom", 6, chainContracts.fantom.bridgedFromTerra),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromTerra),
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromTerra),
  },
  /* broken at the moment, add back in later
  osmosis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: osmosisSupply(UST),
  },
  */
  moonbeam: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply(
      "moonbeam",
      6,
      chainContracts.moonbeam.bridgedFromTerra
    ),
  },
  oasis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromTerra),
  },
  celo: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply("celo", 18, chainContracts.celo.bridgedFromTerra),
  },
  fuse: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: bridgedSupply("fuse", 18, chainContracts.fuse.bridgedFromTerra),
  },
};

export default adapter;
