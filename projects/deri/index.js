const sdk = require("@defillama/sdk");
const { transformPolygonAddress } = require("../helper/portedTokens");
const abi = require("./abi");

async function perpetualPool(
  block,
  chain,
  pool,
  balances,
  transform = (a) => a
) {
  const { output: counts } = await sdk.api.abi.call({
    block,
    target: pool,
    params: [],
    abi: abi["getLengths"],
    chain,
  });

  const bTokenCount = counts[0];
  let bTokenIds = [];
  for (let i = 0; i < parseInt(bTokenCount); i++) {
    bTokenIds.push(i.toString());
  }

  const bTokens = (
    await sdk.api.abi.multiCall({
      calls: bTokenIds.map((bTokenId) => ({
        target: pool,
        params: bTokenId,
      })),
      block,
      abi: abi["getBToken"],
      chain,
    })
  ).output.map((value) => value.output);

  for (let i = 0; i < bTokens.length; i++) {
    let tokenBalance = (
      await sdk.api.erc20.balanceOf({
        block,
        chain,
        target: bTokens[i].bTokenAddress,
        owner: pool,
      })
    ).output;
    sdk.util.sumSingleBalance(
      balances,
      transform(bTokens[i].bTokenAddress),
      tokenBalance
    );
  }
}
async function perpetualPoolLite(
  block,
  chain,
  pool,
  token,
  balances,
  transform = (a) => a
) {
  let tokenBalance = (
    await sdk.api.erc20.balanceOf({
      block,
      chain,
      target: token,
      owner: pool,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, transform(token), tokenBalance);
}

async function v3Pool(
  block,
  chain,
  pool,
  token,
  balances,
  transform = (a) => a,
  decimals = 18
) {
  let liquidity = (
    await sdk.api.abi.call({
      block,
      target: pool,
      params: [],
      abi: abi["v3Liquidity"],
      chain,
    })
  ).output;
  if (decimals !== 18) {
    // fix arbitrum usdc token with decimals 6
    liquidity = liquidity / 10**(18 - decimals)
  }
  sdk.util.sumSingleBalance(balances, transform(token), liquidity);
}

let bscContracts = {
  a: {
    bTokenSymbol: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    pool: "0x66f501dda450C8978c4A1115D7b2A7FAa7702F05",
  },
  b: {
    bTokenSymbol: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    pool: "0x574022307e60bE1f07da6Ec1cB8fE23d426e5831",
    lite: true,
  },
  everlastingOption: {
    bTokenSymbol: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    pool: "0x08aD0E0b4458183758fC5b9b6D27c372965fB780",
    lite: true,
  },
  deriPool: {
    bTokenSymbol: "0xe60eaf5a997dfae83739e035b005a33afdcc6df5",
    pool: "0x26bE73Bdf8C113F3630e4B766cfE6F0670Aa09cF",
    lite: true,
  },
  option: {
    bTokenSymbol: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    pool: "0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E",
    v3: true,
  },
  futureMain: {
    bTokenSymbol: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    pool: "0x4ad5cb09171275A4F4fbCf348837c63a91ffaB04",
    v3: true,
  },
  futureInno: {
    bTokenSymbol: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    pool: "0xD2D950e338478eF7FeB092F840920B3482FcaC40",
    v3: true,
  },
};
let polygonContracts = {
  a: {
    bTokenSymbol: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    pool: "0x4Db087225C920Bec55B2dCEAa629BDc5782623D9",
  },
  b: {
    bTokenSymbol: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    pool: "0xA8769A4Fb0Ca82eb474448B1683DCA3c79798B69",
    lite: true,
  },
  deriPool: {
    bTokenSymbol: "0x3d1d2afd191b165d140e3e8329e634665ffb0e5e",
    pool: "0xdDfCA16Cd80Ae3aeeb7C7ef743924Ac39A94cC9c",
    lite: true,
  },
};

let arbitrumContracts = {
  futureMain: {
    bTokenSymbol: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    pool: "0xDE3447Eb47EcDf9B5F90E7A6960a14663916CeE8",
    v3: true,
  },
};
async function bsc(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const transform = (a) => `bsc:${a}`;
  for (let [key, contract] of Object.entries(bscContracts)) {
    if (contract.lite === true) {
      await perpetualPoolLite(
        chainBlocks["bsc"],
        "bsc",
        contract.pool,
        contract.bTokenSymbol,
        balances,
        transform
      );
    } else if (contract.v3 === true) {
      await v3Pool(
        chainBlocks["bsc"],
        "bsc",
        contract.pool,
        contract.bTokenSymbol,
        balances,
        transform
      );
    } else {
      await perpetualPool(
        chainBlocks["bsc"],
        "bsc",
        contract.pool,
        balances,
        transform
      );
    }
  }
  return balances;
}
async function polygon(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const transform = await transformPolygonAddress();
  for (let [key, contract] of Object.entries(polygonContracts)) {
    if (contract.lite === true) {
      await perpetualPoolLite(
        chainBlocks["polygon"],
        "polygon",
        contract.pool,
        contract.bTokenSymbol,
        balances,
        transform
      );
    } else {
      await perpetualPool(
        chainBlocks["polygon"],
        "polygon",
        contract.pool,
        balances,
        transform
      );
    }
  }
  return balances;
}
async function arbitrum(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const transform = (a) => `arbitrum:${a}`;
  for (let [key, contract] of Object.entries(arbitrumContracts)) {
    if (contract.v3 === true) {
      await v3Pool(
        chainBlocks["arbitrum"],
        "arbitrum",
        contract.pool,
        contract.bTokenSymbol,
        balances,
        transform,
        6,                      // bToken decimals
      );
    }
    return balances;
  }
}
// node test.js projects/deri/index.js
module.exports = {
  bsc: {
    tvl: bsc,
  },
  polygon: {
    tvl: polygon,
  },
  arbitrum: {
    tvl: arbitrum,
  },
};
