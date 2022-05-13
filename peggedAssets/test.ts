const path = require("path");
const { chainsForBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
const { getLatestBlock } = require("@defillama/sdk/build/util/index");
import { PeggedAssetIssuance, PeggedTokenBalance } from "./types";
import { PeggedIssuanceAdapter } from "./peggedAsset.type";
const {
  humanizeNumber,
} = require("@defillama/sdk/build/computeTVL/humanizeNumber");
const chainList = require("./helper/chains.json");
const errorString = "------ ERROR ------";

type ChainBlocks = {
  [chain: string]: number;
};

type BridgeMapping = {
  [chain: string]: PeggedTokenBalance[];
};

const pegTypes = ["peggedUSD"];

async function getLatestBlockRetry(chain: string) {
  for (let i = 0; i < 5; i++) {
    try {
      return await getLatestBlock(chain);
    } catch (e) {
      throw new Error(`Couln't get block heights for chain "${chain}"` + e);
    }
  }
}

async function getPeggedAsset(
  unixTimestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks,
  peggedBalances: PeggedAssetIssuance,
  chain: string,
  issuanceType: string,
  issuanceFunction: any,
  pegType: string,
  bridgedFromMapping: BridgeMapping = {}
) {
  peggedBalances[chain] = peggedBalances[chain] || {};
  const balance = (await issuanceFunction(
    unixTimestamp,
    ethBlock,
    chainBlocks
  )) as PeggedTokenBalance;
  if (balance && Object.keys(balance).length === 0) {
    peggedBalances[chain][issuanceType] = { [pegType]: 0 };
    return;
  }
  if (!balance) {
    throw new Error(`Could not get pegged balance on chain ${chain}`);
  }
  if (typeof balance[pegType] !== "number" || Number.isNaN(balance[pegType])) {
    throw new Error(
      `Pegged balance is not a number, instead it is ${balance[pegType]}. Make sure balance object is exported with key from: ${pegTypes}.`
    );
  }
  peggedBalances[chain][issuanceType] = balance;
  if (issuanceType !== "minted" && issuanceType !== "unreleased") {
    bridgedFromMapping[issuanceType] = bridgedFromMapping[issuanceType] || [];
    bridgedFromMapping[issuanceType].push(balance);
  }
  return;
}

async function calcCirculating(
  peggedBalances: PeggedAssetIssuance,
  bridgedFromMapping: BridgeMapping,
  pegType: string
) {
  let chainCirculatingPromises = Object.keys(peggedBalances).map(
    async (chain) => {
      let circulating: PeggedTokenBalance = { [pegType]: 0 };
      const chainIssuances = peggedBalances[chain];
      Object.entries(chainIssuances).map(
        ([issuanceType, peggedTokenBalance]) => {
          const balance = peggedTokenBalance[pegType];
          if (balance == null) {
            return;
          }
          if (issuanceType === "unreleased") {
            circulating[pegType] = circulating[pegType] || 0;
            circulating[pegType]! -= balance;
          } else {
            circulating[pegType]! = circulating[pegType] || 0;
            circulating[pegType]! += balance;
          }
        }
      );
      if (bridgedFromMapping[chain]) {
        bridgedFromMapping[chain].forEach((peggedTokenBalance) => {
          const balance = peggedTokenBalance[pegType];
          if ((balance == null) || (circulating[pegType] === 0)) {
            console.error(`Null balance or 0 circulating on chain ${chain}`);
            return;
          }
          circulating[pegType]! -= balance;
        });
      }
      if (circulating[pegType]! < 0) {
        throw new Error(
          `Pegged asset on chain ${chain} has negative circulating amount`
        );
      }
      peggedBalances[chain].circulating = circulating;
    }
  );
  await Promise.all(chainCirculatingPromises);

  peggedBalances["totalCirculating"] = {};
  peggedBalances["totalCirculating"]["circulating"] = { [pegType]: 0 };
  peggedBalances["totalCirculating"]["unreleased"] = { [pegType]: 0 };
  let peggedTotalPromises = Object.keys(peggedBalances).map((chain) => {
    const circulating = peggedBalances[chain].circulating;
    const unreleased = peggedBalances[chain].unreleased;
    if (chain !== "totalCirculating") {
      peggedBalances["totalCirculating"]["circulating"][pegType]! +=
        circulating[pegType] || 0;
      peggedBalances["totalCirculating"]["unreleased"][pegType]! +=
        unreleased[pegType] || 0;
    }
  });
  await Promise.all(peggedTotalPromises);
}

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the filename of the adapter to test and the pegType.
      Eg: npx ts-node test projects/myadapter/index peggedUSD`);
  process.exit(1);
}

const passedFile = path.resolve(process.cwd(), process.argv[2]);

(async () => {
  let adapter = {} as PeggedIssuanceAdapter;
  try {
    adapter = require(passedFile);
  } catch (e) {
    console.log(e);
  }
  const module = adapter.default;
  const chains = Object.keys(module).filter(
    (chain) => !["minted", "unreleased"].includes(chain)
  );
  checkExportKeys(passedFile, chains);
  const unixTimestamp = Math.round(Date.now() / 1000) - 60;
  const chainBlocks = {} as ChainBlocks;

  if (!chains.includes("ethereum")) {
    chains.push("ethereum");
  }
  await Promise.all(
    chains.map(async (chainRaw) => {
      const chain = chainRaw === "avalanche" ? "avax" : chainRaw;
      if (chainsForBlocks.includes(chain) || chain === "ethereum") {
        chainBlocks[chain] = (await getLatestBlockRetry(chain)).number - 10;
      }
    })
  );
  const ethBlock = chainBlocks.ethereum;

  let pegType = process.argv[3];
  if (pegType === undefined) {
    pegType = "peggedUSD";
  }
  let peggedBalances: PeggedAssetIssuance = {};
  let bridgedFromMapping: BridgeMapping = {};
  let peggedBalancesPromises = Object.entries(module).map(
    async ([chain, issuances]) => {
      if (typeof issuances !== "object" || issuances === null) {
        return;
      }
      const issuanceTypes = Object.keys(issuances);
      if (
        !(
          issuanceTypes.includes("minted") &&
          issuanceTypes.includes("unreleased")
        )
      ) {
        throw new Error(
          `Chain ${chain} does not have both 'minted' and 'unreleased' issuance.`
        );
      }
      if (issuanceTypes.includes(chain)) {
        throw new Error(`Chain ${chain} has issuance bridged to itself.`);
      }
      let peggedChainPromises = Object.entries(issuances).map(
        async ([issuanceType, issuanceFunctionPromise]) => {
          const issuanceFunction = await issuanceFunctionPromise;
          if (typeof issuanceFunction !== "function") {
            return;
          }
          await getPeggedAsset(
            unixTimestamp,
            ethBlock,
            chainBlocks,
            peggedBalances,
            chain,
            issuanceType,
            issuanceFunction,
            pegType,
            bridgedFromMapping
          );
        }
      );
      await Promise.all(peggedChainPromises);
    }
  );
  await Promise.all(peggedBalancesPromises);
  await calcCirculating(peggedBalances, bridgedFromMapping, pegType);
  if (
    typeof peggedBalances.totalCirculating.circulating[pegType] !== "number"
  ) {
    throw new Error(`Pegged asset doesn't have total circulating`);
  }
  if (peggedBalances.totalCirculating.circulating[pegType]! > 100e9) {
    throw new Error(`Pegged asset total circulating is over 100 billion`);
  }
  if (peggedBalances.totalCirculating.circulating[pegType] === 0) {
    throw new Error(`Returned 0 total circulating`);
  }
  Object.entries(peggedBalances).forEach(([chain, issuances]) => {
    if (chain !== "totalCirculating") {
      console.log(`--- ${chain} ---`);
      Object.entries(issuances)
        .sort((a, b) => (b[1][pegType] ?? 0) - (a[1][pegType] ?? 0))
        .forEach(([issuanceType, issuance]) => {
          console.log(
            issuanceType.padEnd(25, " "),
            humanizeNumber(issuance[pegType])
          );
        });
    }
  });
  console.log(`------ Total Circulating ------`);
  Object.entries(peggedBalances.totalCirculating).forEach(
    ([issuanceType, issuance]) =>
      console.log(
        `Total ${issuanceType}`.padEnd(25, " "),
        humanizeNumber(issuance[pegType])
      )
  );
  process.exit(0);
})();

function checkExportKeys(_filePath: string, chains: string[]) {
  // should check filepath

  const unknownChains = chains.filter((chain) => !chainList.includes(chain));

  if (unknownChains.length) {
    console.log(`
      ${errorString}
  
      Unknown chain(s): ${unknownChains.join(", ")}
      Note: if you think that the chain is correct but missing from our list, please add it to 'projects/helper/chains.json' file
      `);
    process.exit(1);
  }
}

function handleError(error: string) {
  console.log("\n", errorString, "\n\n");
  console.error(error);
  process.exit(1);
}

process.on("unhandledRejection", handleError);
process.on("uncaughtException", handleError);
