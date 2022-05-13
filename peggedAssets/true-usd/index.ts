const sdk = require("@defillama/sdk");
import { multiFunctionBalance, sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import {
  getTokenBalance as tronGetTokenBalance,
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x0000000000085d4780B73119b644AE5ecd22b376"],
  },
  bsc: {
    bridgedFromETH: ["0x14016e85a25aeb13065688cafb43044c2ef86784"],
  },
  avax: {
    bridgedFromETH: ["0x1c20e891bab6b1727d14da358fae2984ed9b59eb"],
  },
  harmony: {
    bridgedFromETH: ["0x553a1151f3df3620fc2b5a75a6edda629e3da350"],
  },
  polygon: {
    bridgedFromETH: ["0x2e1ad108ff1d8c782fcbbb89aad783ac49586756"],
  },
  arbitrum: {
    bridgedFromETH: ["0x4d15a3a2286d883af0aa1b3f21367843fac63e07"],
  },
  fantom: {
    bridgedFromETH: ["0x9879abdea01a879644185341f7af7d8343556b7a"],
  },
  tron: {
    issued: ["TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4"],
  },
  syscoin: {
    bridgedFromETH: ["0x461d52769884ca6235B685EF2040F47d30C94EB5"], // multichain
  },
  heco: {
    bridgedFromETH: ["0x5eE41aB6edd38cDfB9f6B4e6Cf7F75c87E170d98"],
  },
  cronos: {
    issued: ["0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e"],
  },
};

/* 
Sora: 0x006d336effe921106f7817e133686bbc4258a4e0d6fed3a9294d8a8b27312cee, don't know how to query API.
*/

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals);
    }
    return balances;
  };
}

async function tronMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tronGetTotalSupply(
      chainContracts["tron"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply);
    return balances;
  };
}

async function bscMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = 9 * 10 ** 10; // this is hardcoded because Binance API doesn't seem to give 'token' or 'tokens' info that includes TUSD
    const responseMint = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://dex.binance.org/api/v1/account/bnb1hn8ym9xht925jkncjpf7lhjnax6z8nv24fv2yq"
        )
    );
    const responseReserve = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://dex.binance.org/api/v1/account/bnb100dxzy02a6k7vysc5g4kk4fqamr7jhjg4m83l0"
        )
    );
    const mintingAccountObj = responseMint.data.balances.filter(
      (obj: any) => obj.symbol === "TUSDB-888"
    );
    const reserveAccountObj = responseReserve.data.balances.filter(
      (obj: any) => obj.symbol === "TUSDB-888"
    );
    const circulating =
      totalSupply -
      mintingAccountObj[0].free -
      reserveAccountObj[0].free -
      reserveAccountObj[0].frozen;
    if (typeof circulating !== "number") {
      throw new Error("Binance Chain API for TUSD is broken.");
    }
    sumSingleBalance(balances, "peggedUSD", circulating);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  /*
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  */
  /*
   * This is to get Ethereum balance to be 0.
   * This amount on BSC does match the amount bridged from Ethereum, and frequently exceeds it,
   * causing the circulating value on Ethereum to be negative.
   */
  ethereum: {
    minted: multiFunctionBalance(
      [
        bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
        bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
        bridgedSupply("polygon", 18, chainContracts.polygon.bridgedFromETH),
        bridgedSupply("arbitrum", 18, chainContracts.arbitrum.bridgedFromETH),
        bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
        bridgedSupply("syscoin", 18, chainContracts.syscoin.bridgedFromETH),
        bridgedSupply("heco", 18, chainContracts.heco.bridgedFromETH),
      ],
      "peggedUSD"
    ),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: bscMinted(),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
  },
  /* this has 0 supply?
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("harmony", 18, chainContracts.harmony.bridgedFromETH),
  },
  */
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  tron: {
    minted: tronMinted(),
    unreleased: async () => ({}),
  },
  syscoin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "syscoin",
      18,
      chainContracts.syscoin.bridgedFromETH
    ),
  },
  heco: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("heco", 18, chainContracts.heco.bridgedFromETH),
  },
  cronos: {
    minted: chainMinted("cronos", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;
