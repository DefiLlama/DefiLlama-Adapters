const { chainExports } = require("../helper/exports");
const {
  sumTokensAndLPsSharedOwners,
  sumTokens,
} = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

// Used to represent nUSD.
const TUSD = "0x0000000000085d4780b73119b644ae5ecd22b376";
// Used to represent nETH.
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const NFD = "0xdfdb7f72c1f195c5951a234e8db9806eb0635346";

const abi = {
  inputs: [
    {
      internalType: "address",
      name: "tokenAddress",
      type: "address",
    },
  ],
  name: "getFeeBalance",
  outputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

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
    bridge: "0xd123f70ae324d34a9e76b67a27bf77593ba8749f",
    bridgeAssets: [
      "0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63", // HIGH
      "0x0fe9778c005a5a6115cbe12b0568a2d50b765a51", // NFD
      "0x130025ee738a66e691e6a7a62381cb33c6d9ae83", // JUMP
      "0x23b891e5c62e0955ae2bd185990103928ab817b3", // nUSD
      "0xaa88c603d142c371ea0eac8756123c5805edee03", // DOG
    ],
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
    bridge: "0xaf41a65f786339e7911f4acdad6bd49426f2dc6b",
    bridgeAssets: [
      "0xED2a7edd7413021d440b09D654f3b87712abAB66", // nUSD
    ],
  },
  ethereum: {
    stables: [
      "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    ],
    pool: "0x1116898DdA4015eD8dDefb84b6e8Bc24528Af2d8",
    bridge: "0x2796317b0ff8538f253012862c06787adfb8ceb6",
    nusd: "0x1b84765de8b7566e4ceaf4d0fd3c5af52d3dde4f",
    bridgeAssets: [
      "0x71ab77b7dbb4fa7e017bc15090b2163221420282", // HIGH
      WETH,
      "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
      "0xbaac2b4491727d78d2b78815144570b9f2fe8899", // DOG
      "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f", // gOHM
      "0x1b84765de8b7566e4ceaf4d0fd3c5af52d3dde4f", // nUSD
    ],
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
    bridge: "0x8f5bbb2bb8c2ee94639e55d5f41de9b4839c1280",
    bridgeAssets: [
      "0x0a5926027d407222f8fe20f24cb16e103f617046", // NFD
      "0xd8ca34fd379d9ca3c6ee3b3905678320f5b45195", // gOHM
      "0xb6c473756050de474286bed418b77aeac39b02af", // nUSD
    ],
  },
  avax: {
    stables: [
      "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", // DAI
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC
      "0xc7198437980c041c805a1edcba50c1ce5db95118", // USDT
    ],
    nusd: "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46",
    pool: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
    neth: "0x19e1ae0ee35c0404f835521146206595d37981ae",
    legacy: {
      basepool: "0xE55e19Fb4F2D85af758950957714292DAC1e25B2",
      metapool: "0xf44938b0125a6662f9536281ad2cd6c499f22004",
    },
    bridge: "0xc05e61d0e7a63d27546389b7ad62fdff5a91aace",
    ethPool: "0x77a7e60555bC18B4Be44C181b2575eee46212d44",
    // Well this is really Aave Avalanche Market WETH
    weth: "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21",
    bridgeAssets: [
      "0xf1293574ee43950e7a8c9f1005ff097a9a713959", // NFD
      "0x321e7092a180bb43555132ec53aaa65a5bf84251", // gOHM
      "0x19e1ae0ee35c0404f835521146206595d37981ae", // nETH
      "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46", // nUSD
    ],
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
    bridge: "0xaf41a65f786339e7911f4acdad6bd49426f2dc6b",
    bridgeAssets: [
      "0x91fa20244fb509e8289ca630e5db3e9166233fdc", // gOHM
      "0x78de9326792ce1d6eca0c978753c6953cdeedd73", // JUMP
      "0xED2a7edd7413021d440b09D654f3b87712abAB66", // nUSD
    ],
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
    bridge: "0x6f4e8eba4d337f874ab57478acc2cb5bacdc19c9",
    bridgeAssets: [
      "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1", // gOHM
      "0x3ea9b0ab55f34fb188824ee288ceaefc63cf908e", // nETH
      "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688", // nUSD
    ],
  },
  boba: {
    stables: [
      "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35", // DAI
      "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc", // USDC
      "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d", // USDT
    ],
    nusd: "0x6B4712AE9797C199edd44F897cA09BC57628a1CF",
    neth: "0x96419929d7949D6A801A6909c145C8EEf6A40431",
    weth: "0xd203De32170130082896b4111eDF825a4774c18E",
    pool: "0x75FF037256b36F15919369AC58695550bE72fead",
    ethPool: "0x753bb855c8fe814233d26Bb23aF61cb3d2022bE5",
    bridge: "0x432036208d2717394d2614d6697c46df3ed69540",
    bridgeAssets: [
      "0x6B4712AE9797C199edd44F897cA09BC57628a1CF", // nUSD
      "0x96419929d7949D6A801A6909c145C8EEf6A40431", // nETH
    ],
  },
  optimism: {
    neth: "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",
    weth: "0x121ab82b49B2BC4c7901CA46B8277962b4350204",
    ethPool: "0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9",
    bridge: "0xaf41a65f786339e7911f4acdad6bd49426f2dc6b",
    bridgeAssets: [
      "0x809DC529f07651bD43A172e8dB6f4a7a0d771036", // nETH
    ],
  },
  moonriver: {
    bridge: "0xaed5b25be1c3163c907a471082640450f928ddfe",
    bridgeAssets: [
      "0xe96ac70907fff3efee79f502c985a7a21bce407d", // synFRAX
      "0x3bf21ce864e58731b6f28d68d5928bcbeb0ad172", // gOHM
    ],
  },
  aurora: {
    stables: [
      "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802", // USDC
      "0x4988a896b1227218e4A686fdE5EabdcAbd91571f", // USDT
    ],
    bridge: "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
    bridgeAssets: [],
    nusd: "0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c",
    pool: "0xcEf6C2e20898C2604886b888552CA6CcF66933B0",
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
  // WETH (BOBA) -> WETH (ETH)
  "0xd203De32170130082896b4111eDF825a4774c18E": WETH,
  // WETH (OPTIMISM) -> WETH (ETH)
  "0x121ab82b49B2BC4c7901CA46B8277962b4350204": WETH,
  // NFD (BSC) -> NFD (ETH)
  "0x0fe9778c005a5a6115cbe12b0568a2d50b765a51": NFD,
  // NFD (POLYGON) -> NFD (ETH)
  "0x0a5926027d407222f8fe20f24cb16e103f617046": NFD,
  // NFD (AVAX) -> NFD (ETH)
  "0xf1293574ee43950e7a8c9f1005ff097a9a713959": NFD,
  // WONE (ONE)
  "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a": "wrapped-one",
  // synFRAX (MOVR) -> FRAX (ETH)
  "0xe96ac70907fff3efee79f502c985a7a21bce407d":
    "0x853d955acef822db058eb8505911ed77f175b99e",
  // gOHM (MOVR) -> gOHM (ETH)
  "0x3bf21ce864e58731b6f28d68d5928bcbeb0ad172":
    "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f",
  // avWETH (AVAX) -> WETH (ETH)
  "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21": WETH,
  // USDC (NEAR) -> USDC (ETH)
  "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802":
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
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

const mapStables = (data) => {
  let stables = [];

  if (data.stables) stables = data.stables.map((x) => [x, data.pool]);

  if (data.nusd) stables.push([data.nusd, data.pool]);

  if (data.neth && data.ethPool)
    stables.push([data.neth, data.ethPool], [data.weth, data.ethPool]);

  return stables;
};

const bridgeTVL = async (balances, data, block, chain, transform) => {
  await sumTokens(
    balances,
    data.bridgeAssets.map((x) => [x, data.bridge]),
    block,
    chain,
    transform
  );

  const { output } = await sdk.api.abi.multiCall({
    calls: data.bridgeAssets.map((x) => ({
      target: data.bridge,
      params: [x],
    })),
    abi,
    block,
    chain,
  });

  // Take away unwithdrawn admin fees from bridge contract's balance.
  output.forEach((x) => {
    const token = x.input.params[0];
    balances[transform(token)] = BigNumber(balances[transform(token)])
      .minus(x.output)
      .toFixed(0);
  });
};

const ethPool2 = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [["0x4a86c01d67965f8cb3d0aaa2c655705e64097c31", true]], // SYN/ETH SLP
    ["0xd10eF2A513cEE0Db54E959eF16cAc711470B62cF"], // MiniChefV2
    ethBlock
  );

  return balances;
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

    await sumTokens(balances, mapStables(data), block, chain, transform);
    await bridgeTVL(balances, data, block, chain, transform);

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
  "optimism",
  "moonriver",
  "aurora",
]);
module.exports.methodology = `Synapse AMM pools and tokens locked on the Synapse bridge are counted as TVL`;
module.exports.misrepresentedTokens = true;
module.exports.ethereum.pool2 = ethPool2;
