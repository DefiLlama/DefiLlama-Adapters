const { chainExports } = require("../helper/exports");
const { sumTokens } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");

// Used to represent nUSD.
const TUSD = "0x0000000000085d4780b73119b644ae5ecd22b376";
// Used to represent nETH.
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const DATA = {
  bsc: {
    stables: [
      "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
      "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
      "0x55d398326f99059ff775485246999027b3197955", // USDT
    ],
    nusd: "0x23b891e5c62e0955ae2bd185990103928ab817b3",
    pool: "0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13",
    legacy: {
      metapool: "0x930d001b7efb225613aC7F35911c52Ac9E111Fa9",
      basepool: "0x938aFAFB36E8B1AB3347427eb44537f543475cF9",
    },
  },
  harmony: {
    stables: [
      "0xef977d2f931c1978db5f6747666fa1eacb0d0339", // DAI
      "0x985458e523db3d53125813ed68c274899e9dfab4", // USDC
      "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f", // USDT
    ],
    nusd: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
    pool: "0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e",
    legacy: {
      metapool: "0x555982d2E211745b96736665e19D9308B615F78e",
      basepool: "0x080f6aed32fc474dd5717105dba5ea57268f46eb",
    },
  },
  ethereum: {
    stables: [
      "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    ],
    pool: "0x1116898DdA4015eD8dDefb84b6e8Bc24528Af2d8",
  },
  polygon: {
    stables: [
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
    ],
    nusd: "0xb6c473756050de474286bed418b77aeac39b02af",
    pool: "0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5",
    legacy: {
      basepool: "0x3f52E42783064bEba9C1CFcD2E130D156264ca77",
      metapool: "0x96cf323e477ec1e17a4197bdcc6f72bb2502756a",
    },
  },
  avax: {
    stables: [
      "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", // DAI
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC
      "0xc7198437980c041c805a1edcba50c1ce5db95118", // USDT
    ],
    nusd: "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46",
    pool: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
    legacy: {
      basepool: "0xE55e19Fb4F2D85af758950957714292DAC1e25B2",
      metapool: "0xf44938b0125a6662f9536281ad2cd6c499f22004",
    },
  },
  fantom: {
    stables: [
      "0x82f0b8b456c1a451378467398982d4834b6829c1", // MIM
      "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
      "0x049d68029688eabf473097a2fc38ef61633a3c7a", // USDT
    ],
    nusd: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
    pool: "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",
    legacy: {
      basepool: "0x080F6AEd32Fc474DD5717105Dba5ea57268F46eb",
      metapool: "0x1f6a0656ff5061930076bf0386b02091e0839f9f",
    },
  },
  arbitrum: {
    stables: [
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", // MIM
    ],
    nusd: "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688",
    neth: "0x3ea9b0ab55f34fb188824ee288ceaefc63cf908e",
    weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    pool: "0x0Db3FE3B770c95A0B99D1Ed6F2627933466c0Dd8",
    ethPool: "0xa067668661C84476aFcDc6fA5D758C4c01C34352",
    legacy: {
      basepool: "0xbafc462d00993ffcd3417abbc2eb15a342123fda",
      metapool: "0x84cd82204c07c67df1c2c372d8fd11b3266f76a3",
    },
  },
  boba: {
    stables: [
      "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35", // DAI
      "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc", // USDC
      "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d", // USDT
    ],
    nusd: "0x6B4712AE9797C199edd44F897cA09BC57628a1CF",
    pool: "0x75FF037256b36F15919369AC58695550bE72fead",
  },
};

const misrepresentedTokensMap = {
  // MIM (FTM) -> MIM (ARB)
  "0x82f0b8b456c1a451378467398982d4834b6829c1":
    "arbitrum:0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
  // fUSDT (FTM) -> USDT (ETH)
  "0x049d68029688eabf473097a2fc38ef61633a3c7a":
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // DAI (BOBA) -> DAI (ETH)
  "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // USDC (BOBA) -> USDC (ETH)
  "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc":
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // USDT (BOBA) -> USDT (ETH)
  "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d":
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
};

const sumLegacyPools = async (balances, block, chain, transform) => {
  const data = DATA[chain].legacy;

  for (const pool in data) {
    // sumTokens() doesn't return error out if the token doesn't exist on the
    // pool, so we don't need to check if the tokens exist in the pool.
    const stables = DATA[chain].stables.map((x) => [x, data[pool]]);
    stables.push([DATA[chain].nusd, data[pool]]);

    await sumTokens(balances, stables, block, chain, transform);
  }
};

const mapStables = (data, chain) => {
  const stables = data.stables.map((x) => [x, data.pool]);
  if (chain !== "ethereum") stables.push([data.nusd, data.pool]);

  if (chain === "arbitrum")
    stables.push([data.neth, data.ethPool], [data.weth, data.ethPool]);

  return stables;
};

const chainTVL = (chain) => {
  const transform = (token) => {
    if (token === DATA[chain].nusd) return TUSD;
    else if (token === DATA[chain]?.neth) return WETH;
    else if (token in misrepresentedTokensMap)
      return misrepresentedTokensMap[token];

    return `${chain}:${token}`;
  };

  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const block = await getBlock(timestamp, chain, chainBlocks);
    const data = DATA[chain];

    await sumTokens(balances, mapStables(data, chain), block, chain, transform);

    if (chain !== "ethereum")
      await sumLegacyPools(balances, block, chain, transform);

    return balances;
  };
};

module.exports = chainExports(chainTVL, [
  "ethereum",
  "bsc",
  "polygon",
  "avax",
  "fantom",
  "arbitrum",
  "harmony",
  "boba",
]);
module.exports.methodology = "Synapse AMM pools are counted as TVL";
module.exports.misrepresentedTokens = true;
