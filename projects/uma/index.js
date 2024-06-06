const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const { requery } = require("../helper/requery");
const { getChainTransform } = require("../helper/portedTokens");
const { getBlock } = require("../helper/http");
const { getLogs } = require('../helper/cache/getLogs')
const abi = require("./abi");

const ethLspCreators = [
  "0x0b8de441B26E36f461b2748919ed71f50593A67b",
  "0x60F3f5DDE708D097B7F092EFaB2E085AC0a82F42",
  "0x31C893843685f1255A26502eaB5379A3518Aa5a9",
  "0x9504b4ab8cd743b06074757d3B1bE3a3aF9cea10",
  "0x439a990f83250FE2E5E6b8059F540af1dA1Ba04D",
];
const polygonLspCreators = [
  "0x3e665D15425fAee14eEF53B9caaa0762b243911a",
  "0x62410e96a2ceB4d66824346e3264d1D9107a0aBE",
  "0x5Fd7FFF20Ee851cD7bEE72fB3C6d324e4C104c9f",
  "0x4FbA8542080Ffb82a12E3b596125B1B02d213424",
];
const bobaLspCreators = [
  "0xC064b1FE8CE7138dA4C07BfCA1F8EEd922D41f68",
];
const ethEmpCreators = [
  "0xad8fD1f418FB860A383c9D4647880af7f043Ef39",
  "0x9A077D4fCf7B26a0514Baa4cff0B481e9c35CE87",
  "0xddfC7E3B4531158acf4C7a5d2c3cB0eE81d018A5",
];

// Captures TVL for EMP contracts on Ethereum
async function ethEmp(api) {
  const block = api.block
  const balances = {};
  for (let i = 0; i < ethEmpCreators.length; i++) {
    const logs = await getLogs({
      target: ethEmpCreators[i],
      topic: "CreatedExpiringMultiParty(address,address)",
      fromBlock: 9937650,
      api,
    });
    const collaterals = await sdk.api.abi.multiCall({
      calls: logs.map((poolLog) => ({
        target: `0x${poolLog.topics[1].slice(26)}`,
      })),
      block,
      abi: abi.collateralCurrency,
    });
    await requery(collaterals, "ethereum", block, abi);
    await sumTokens(
      balances,
      collaterals.output
        .filter((t) => t.output !== null)
        .map((c) => [c.output, c.input.target]),
      block
    );
  }
  return balances;
}

// Captures TVL for LSP contracts on Ethereum
async function ethLsp(api) {
  const block = api.block
  const balances = {};
  for (let i = 0; i < ethLspCreators.length; i++) {
    const logs = await getLogs({
      target: ethLspCreators[i],
      topic: "CreatedLongShortPair(address,address,address,address)",
      fromBlock: 12736035,
      api,
    });
    const collaterals = await sdk.api.abi.multiCall({
      calls: logs.map((poolLog) => ({
        target: `0x${poolLog.topics[1].slice(26)}`,
      })),
      block,
      abi: abi.collateralToken,
    });
    await requery(collaterals, "ethereum", block, abi);
    await sumTokens(
      balances,
      collaterals.output
        .filter((t) => t.output !== null)
        .map((c) => [c.output, c.input.target]),
      block
    );
  }
  return balances;
}

// Captures TVL for LSP contracts on Polygon
async function polygonLsp(api) {
  const block = api.block
  const balances = {};
  const transform = await getChainTransform('polygon');
  
  for (let i = 0; i < polygonLspCreators.length; i++) {
    const logs = await getLogs({
      target: polygonLspCreators[i],
      topic: "CreatedLongShortPair(address,address,address,address)",
      fromBlock: 16241492,
      api,
    });
    const collaterals = await sdk.api.abi.multiCall({
      calls: logs.map((poolLog) => ({
        target: `0x${poolLog.topics[1].slice(26)}`,
      })),
      block,
      abi: abi.collateralToken,
      chain: "polygon",
    });
    await requery(collaterals, "polygon", block, abi);
    await sumTokens(
      balances,
      collaterals.output
        .filter((t) => t.output !== null)
        .map((c) => [c.output, c.input.target]),
      block,
      "polygon",
      transform
    );
  }
  return balances;
}

// Captures TVL for LSP contracts on Boba
async function bobaLsp(api) {
  const block = api.block
  const chain = "boba";
  const balances = {};
  const transform = await getChainTransform(chain);

  for (let i = 0; i < bobaLspCreators.length; i++) {
    const lspCreatorAddress = bobaLspCreators[i];
    const logs = await getLogs({
      target: lspCreatorAddress,
      topic: "CreatedLongShortPair(address,address,address,address)",
      fromBlock: 291475,
      api,
    });

    const collaterals = await sdk.api.abi.multiCall({
      calls: logs.map((poolLog) => ({
        target: `0x${poolLog.topics[1].slice(26)}`,
      })),
      block,
      abi: abi.collateralToken,
      chain,
    });
    
    await requery(collaterals, chain, block, abi);
    await sumTokens(
      balances,
      collaterals.output
        .filter((t) => t.output !== null)
        .map((c) => [c.output, c.input.target]),
      block,
      chain,
      transform
    );
  }
  
  return balances;
}

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethEmp, ethLsp]),
  },
  polygon: {
    tvl: sdk.util.sumChainTvls([polygonLsp]),
  },
  boba: {
    tvl: sdk.util.sumChainTvls([bobaLsp]),
  },
};
