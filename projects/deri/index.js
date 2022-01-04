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

  for (i = 0; i < bTokens.length; i++) {
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
let bscContracts = {
  a: {
    bTokenSymbol: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    pool: "0x8Eab619E6A8f7E8891598cADe6546a1214385D42",
  },
  b: {
    bTokenSymbol: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    pool: "0x8Eab619E6A8f7E8891598cADe6546a1214385D42",
    lite: true,
  },
  everlastingOption: {
    bTokenSymbol: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    pool: "0x574022307e60bE1f07da6Ec1cB8fE23d426e5831",
    lite: true,
  },
  deriPool: {
    bTokenSymbol: "0xe60eaf5a997dfae83739e035b005a33afdcc6df5",
    pool: "0x26bE73Bdf8C113F3630e4B766cfE6F0670Aa09cF",
    lite: true,
  },
};
let polygonContracts = {
  a: {
    bTokenSymbol: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    pool: "0x64195d64655A97023d78a69195D3ee15B8E1Dd13",
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
async function bsc(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const transform = (a) => `bsc:${a}`;
  for ([key, contract] of Object.entries(bscContracts)) {
    if (contract.lite === true) {
      await perpetualPoolLite(
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
  for ([key, contract] of Object.entries(polygonContracts)) {
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
// node test.js projects/deri/index.js
module.exports = {
  bsc: {
    tvl: bsc,
  },
  polygon: {
    tvl: polygon,
  },
};
