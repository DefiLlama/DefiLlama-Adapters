const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");
const abi = require("./abi.json");
const abiVaultChef = require("./abiVaultChef.json");
const abiStrat = require("./abiStrat.json");
const erc20 = require("../helper/abis/erc20.json");

const vaultChef = "0xf2E8fC408d77e8fC012797654D76ed399BFcE174";
const masterChef = "0x8CFD1B9B7478E7B0422916B72d1DB6A9D513D734";

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["polygon"];
  let balances = {};

  // --- Check the masterchef poolLenght and all the bal from lp/underlyings ---
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterChef,
      block,
      chain: "polygon",
    })
  ).output;

  const lpAddresses = [];

  for (let i = 0; i < poolLength; i++) {
    const poolInfo = (
      await sdk.api.abi.call({
        block,
        target: masterChef,
        params: i,
        abi: abi.poolInfo,
        chain: "polygon",
      })
    ).output;

    lpAddresses.push(poolInfo[0]);
  }

  const symbols1 = (
    await sdk.api.abi.multiCall({
      block,
      abi: 'erc20:symbol',
      calls: lpAddresses.map((addr) => ({ target: addr })),
      chain: "polygon",
    })
  ).output.map((token) => token.output);

  const balOf = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpAddresses.map((lp) => ({
        target: lp,
        params: masterChef,
      })),
      chain: "polygon",
      block,
    })
  ).output.map((bal) => bal.output);

  let lpPositions = [];

  balOf.forEach((bal, idx) => {
    if (symbols[idx] === 'UNI-V2' || symbols[idx] === 'SLP') {
      lpPositions.push({
        balance: bal,
        token: lpAddresses[idx],
      });
    } else {
      sdk.util.sumSingleBalance(balances, `polygon:${lpAddresses[idx]}`, bal);
    }
  });

  const transformAdress = await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    "polygon",
    transformAdress
  );

  // --- Check the vaultChef poolLenght and all the bal from lp/underlyings ---
  const stratLength = (
    await sdk.api.abi.call({
      abi: abiVaultChef.poolLength,
      target: vaultChef,
      block,
      chain: "polygon",
    })
  ).output;

  const stratAddresses = [];

  for (let i = 0; i < stratLength; i++) {
    const stratInfo = (
      await sdk.api.abi.call({
        block,
        target: vaultChef,
        params: i,
        abi: abiVaultChef.poolInfo,
        chain: "polygon",
      })
    ).output;
    stratAddresses.push(stratInfo);
  }


  const sharesTotals = (
    await sdk.api.abi.multiCall({
      abi: abiStrat.sharesTotal,
      calls: stratAddresses.map((strat) => ({
        target: strat[1],
      })),
      chain: "polygon",
      block,
    })
  ).output.map((bal) => bal.output);

  const symbols = (
    await sdk.api.abi.multiCall({
      block,
      abi: 'erc20:symbol',
      calls: stratAddresses.map((addr) => ({ target: addr[0] })),
      chain: "polygon",
    })
  ).output.map((token) => token.output);

  lpPositions = [];

  sharesTotals.forEach((sharesTotal, idx) => {
    if (symbols[idx] === 'UNI-V2' || symbols[idx] === 'SLP') {
      lpPositions.push({
        balance: sharesTotal,
        token: stratAddresses[idx][0],
      });
    } else {
      console.log('Non zero:', stratAddresses[idx][0], sharesTotal);
      sdk.util.sumSingleBalance(
        balances,
        `polygon:${stratAddresses[idx][0]}`,
        sharesTotal
      );
    }
  });
  
  const transformAdressStrat = await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    "polygon",
    transformAdressStrat
  );

  return balances;
};

module.exports = {
  tvl: polygonTvl
};