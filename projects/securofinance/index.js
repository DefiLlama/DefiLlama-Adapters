const sdk = require("@defillama/sdk");
const abiMwi = require("./abiMwi.json");
const abiBni = require("./abiBni.json");
const abiLci = require("./abiLci.json");

const SecuroVault = {
  MWIAvalanche: "0x5aCBd5b82edDae114EC0703c86d163bD0107367c",
  BNIAvalanche: "0xe76367024ca3AEeC875A03BB395f54D7c6A82eb0",
  BNIAurora: "0x72eB6E3f163E8CFD1Ebdd7B2f4ffB60b6e420448",
  LCIBsc: "0x8FD52c2156a0475e35E0FEf37Fa396611062c9b6",
  BNIPolygon: "0xF9258759bADb75a9eAb16933ADd056c9F4E489b6",
  //MoneyPrinter: "0x3DB93e95c9881BC7D9f2C845ce12e97130Ebf5f2",
};

//timestamp, ethereumBlock, chainBlocks
async function tvlBsc(timestamp, ethereumBlock, chainBlocks) {
  let block = await sdk.api.util.lookupBlock(timestamp);

  let [
    MWIAvalancheTVL,
    BNIAvalancheTVL,
    BNIAuroraTVL,
    LCIBscTVL,
    BNIPolygonTVL,
  ] = await Promise.all([
    sdk.api.abi.call({
      target: SecuroVault.MWIAvalanche, // contract address
      chain: "avax",
      abi: abiMwi.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),

    sdk.api.abi.call({
      target: SecuroVault.BNIAvalanche, // contract address
      chain: "avax",
      abi: abiBni.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),
    sdk.api.abi.call({
      target: SecuroVault.BNIAurora, // contract address
      chain: "aurora",
      abi: abiBni.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),

    sdk.api.abi.call({
      target: SecuroVault.LCIBsc, // contract address
      chain: "bsc",
      abi: abiLci.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),

    sdk.api.abi.call({
      target: SecuroVault.BNIPolygon, // contract address
      chain: "polygon",
      abi: abiBni.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
      //   params: [false],
    }),
  ]);

  MWIAvalancheTVL = parseInt(MWIAvalancheTVL.output) / 10 ** 18;
  BNIAvalancheTVL = parseInt(BNIAvalancheTVL.output) / 10 ** 18;
  BNIAuroraTVL = parseInt(BNIAuroraTVL.output) / 10 ** 18;
  LCIBscTVL = parseInt(LCIBscTVL.output) / 10 ** 18;
  BNIPolygonTVL = parseInt(BNIPolygonTVL.output) / 10 ** 18;

  const result = {
    "Market Weighted Index Avalanche Vault": MWIAvalancheTVL,
    "Citadel Vault": BNIAvalancheTVL,
    "Cuban Vault": BNIAuroraTVL,
    "Metaverse Vault": LCIBscTVL,
    "FAANG Vault": BNIPolygonTVL,
  };

  let balances = 0;
  for (const prop in result) {
    balances += result[prop];
  }
  return { "usd-coin": balances };
}

async function tvlBsc(timestamp, ethereumBlock, chainBlocks) {
  let block = await sdk.api.util.lookupBlock(timestamp);

  let [LCIBscTVL] = await Promise.all([
    sdk.api.abi.call({
      target: SecuroVault.LCIBsc, // contract address
      chain: "bsc",
      abi: abiLci.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),
  ]);

  LCIBscTVL = parseInt(LCIBscTVL.output) / 10 ** 18;

  const result = {
    "LCI Binance Vault": LCIBscTVL,
  };

  let balances = 0;
  for (const prop in result) {
    balances += result[prop];
  }
  return { "usd-coin": balances };
}

async function tvlAurora(timestamp, ethereumBlock, chainBlocks) {
  let block = await sdk.api.util.lookupBlock(timestamp);

  let [BNIAuroraTVL] = await Promise.all([
    sdk.api.abi.call({
      target: SecuroVault.BNIAurora, // contract address
      chain: "aurora",
      abi: abiBni.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),
  ]);

  BNIAuroraTVL = parseInt(BNIAuroraTVL.output) / 10 ** 18;

  const result = {
    "BNI Aurora Vault": BNIAuroraTVL,
  };

  let balances = 0;
  for (const prop in result) {
    balances += result[prop];
  }
  return { "usd-coin": balances };
}

async function tvlAvax(timestamp, ethereumBlock, chainBlocks) {
  let block = await sdk.api.util.lookupBlock(timestamp);

  let [MWIAvalancheTVL, BNIAvalancheTVL] = await Promise.all([
    sdk.api.abi.call({
      target: SecuroVault.MWIAvalanche, // contract address
      chain: "avax",
      abi: abiMwi.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),

    sdk.api.abi.call({
      target: SecuroVault.BNIAvalanche, // contract address
      chain: "avax",
      abi: abiBni.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
    }),
  ]);

  MWIAvalancheTVL = parseInt(MWIAvalancheTVL.output) / 10 ** 18;
  BNIAvalancheTVL = parseInt(BNIAvalancheTVL.output) / 10 ** 18;

  const result = {
    "Market Weighted Index Avalanche Vault": MWIAvalancheTVL,
    "BNI Avalanche Vault": BNIAvalancheTVL,
  };

  let balances = 0;
  for (const prop in result) {
    balances += result[prop];
  }
  return { "usd-coin": balances };
}

async function tvlPolygon(timestamp, ethereumBlock, chainBlocks) {
  let block = await sdk.api.util.lookupBlock(timestamp);

  let [BNIPolygonTVL] = await Promise.all([
    sdk.api.abi.call({
      target: SecuroVault.BNIPolygon, // contract address
      chain: "polygon",
      abi: abiBni.getAllPoolInUSD, // erc20:methodName
      block: block[block], // Current block number
      //   params: [false],
    }),
  ]);

  BNIPolygonTVL = parseInt(BNIPolygonTVL.output) / 10 ** 18;

  const result = {
    "Polygon BNI Vault": BNIPolygonTVL,
  };

  let balances = 0;
  for (const prop in result) {
    balances += result[prop];
  }
  return { "usd-coin": balances };
}

// node test.js projects/daoventures/index.js
// async function stakingTvl(timestamp, block) {
//   let balances = {};
//   let { output: balance } = await sdk.api.erc20.balanceOf({
//     target: "0x77dce26c03a9b833fc2d7c31c22da4f42e9d9582",
//     owner: "0x1193c036833B0010fF80a3617BBC94400A284338",
//     block,
//   });

//   sdk.util.sumSingleBalance(
//     balances,
//     "0x77dce26c03a9b833fc2d7c31c22da4f42e9d9582",
//     balance
//   );

//   return balances;
// }

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: tvlBsc,
  },
  polygon: {
    tvl: tvlPolygon,
  },
  avax: {
    tvl: tvlAvax,
  },
  aurora: {
    tvl: tvlAurora,
  },
  methodology: "We count total value in different strategy vaults",
};
