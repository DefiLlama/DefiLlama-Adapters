const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const { requery } = require("../helper/requery");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { getBlock } = require("../helper/getBlock");
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
const ethEmpCreators = [
  "0xad8fD1f418FB860A383c9D4647880af7f043Ef39",
  "0x9A077D4fCf7B26a0514Baa4cff0B481e9c35CE87",
  "0xddfC7E3B4531158acf4C7a5d2c3cB0eE81d018A5",
];

// Captures TVL for EMP contracts on Ethereum
async function ethEmp(timestamp, block) {
  const balances = {};
  for (let i = 0; i < ethEmpCreators.length; i++) {
    const logs = await sdk.api.util.getLogs({
      target: ethEmpCreators[i],
      topic: "CreatedExpiringMultiParty(address,address)",
      keys: ["topics"],
      fromBlock: 9937650,
      toBlock: block,
    });
    const collaterals = await sdk.api.abi.multiCall({
      calls: logs.output.map((poolLog) => ({
        target: `0x${poolLog[1].slice(26)}`,
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
async function ethLsp(timestamp, block) {
  const balances = {};
  for (let i = 0; i < ethLspCreators.length; i++) {
    const logs = await sdk.api.util.getLogs({
      target: ethLspCreators[i],
      topic: "CreatedLongShortPair(address,address,address,address)",
      keys: ["topics"],
      fromBlock: 12736035,
      toBlock: block,
    });
    const collaterals = await sdk.api.abi.multiCall({
      calls: logs.output.map((poolLog) => ({
        target: `0x${poolLog[1].slice(26)}`,
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
async function polygonLsp(timestamp, block, chainBlocks) {
  const balances = {};
  for (let i = 0; i < polygonLspCreators.length; i++) {
    const transform = await transformPolygonAddress();
    block = await getBlock(timestamp, "polygon", chainBlocks);
    const logs = await sdk.api.util.getLogs({
      target: polygonLspCreators[i],
      topic: "CreatedLongShortPair(address,address,address,address)",
      keys: ["topics"],
      fromBlock: 16241492,
      toBlock: block,
      chain: "polygon",
    });
    const collaterals = await sdk.api.abi.multiCall({
      calls: logs.output.map((poolLog) => ({
        target: `0x${poolLog[1].slice(26)}`,
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

// Captures TVL for Jarvis LSP contracts on Polygon
async function jarvisLsp(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();
  block = await getBlock(timestamp, "polygon", chainBlocks);
  const logs = await sdk.api.util.getLogs({
    target: "0xD5ed74178Fa50EfD7d3E3f30EF5f0ACab56933Bc",
    topic: "CreatedPerpetual(address,address)",
    keys: ["topics"],
    fromBlock: 17618954,
    toBlock: block,
    chain: "polygon",
  });
  const collaterals = await sdk.api.abi.multiCall({
    calls: logs.output.map((poolLog) => ({
      target: `0x${poolLog[1].slice(26)}`,
    })),
    block,
    abi: abi.collateralCurrency,
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
  return balances;
}

// Captures TVL for Across liquidity pools on L1
async function across(timestamp, block) {
  const balances = {};
  const logs = await sdk.api.util.getLogs({
    target: "0x30B44C676A05F1264d1dE9cC31dB5F2A945186b6",
    topic: "WhitelistToken(uint256,address,address,address)",
    keys: ["topics"],
    fromBlock: 13544988,
    toBlock: block,
  });
  const bridgePoolAddresses = logs.output.map(function (bridgePool) {
    return bridgePool[3];
  });
  const uniquePools = [
    ...new Set(bridgePoolAddresses.map((a) => JSON.stringify(a))),
  ].map((a) => JSON.parse(a));
  const collaterals = await sdk.api.abi.multiCall({
    calls: uniquePools.map((poolLog) => ({
      target: `0x${poolLog.slice(26)}`,
    })),
    block,
    abi: abi.l1Token,
  });
  await requery(collaterals, "ethereum", block, abi);
  await sumTokens(
    balances,
    collaterals.output
      .filter((t) => t.output !== null)
      .map((c) => [c.output, c.input.target]),
    block
  );
  return balances;
}

// Captures TVL for Sherlock liquidity that uses UMA's OO/DVM
async function sherlock(timestamp, block) {
  const AaveContract = "0xEECee260A402FE3c20e5B8301382005124bef121";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const aUSDC = "0xBcca60bB61934080951369a648Fb03DF4F96263C";
  const SherlockContract = "0xacbBe1d537BDa855797776F969612df7bBb98215";
  const usdcabi = {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
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

  let balances = {};
  const AaveTVL = await sdk.api.abi.call({
    target: AaveContract,
    abi: abi["balanceOf"],
    block: block,
  });
  const SherlockTVL = await sdk.api.abi.call({
    target: USDC,
    abi: usdcabi,
    params: SherlockContract,
    block: block,
  });

  balances[aUSDC] = AaveTVL.output;
  balances[USDC] = SherlockTVL.output;

  return balances;
}

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethEmp, across, ethLsp]),
  },
  polygon: {
    tvl: sdk.util.sumChainTvls([polygonLsp, jarvisLsp, sherlock]),
  },
};
