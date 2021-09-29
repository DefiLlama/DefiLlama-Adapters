const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");
const abi = require("./abi.json");
const abiVaultChef = require("./abiVaultChef.json");
const abiStrat = require("./abiStrat.json");
const erc20 = require("../helper/abis/erc20.json");
const tvlOnPairs = require("../helper/processPairs.js");

const vaultChef = "0xBdA1f897E851c7EF22CD490D2Cf2DAce4645A904";
const masterChef = "0x4ce9Ae2f5983e19AebF5b8Bae4460f2B9EcE811a";
const FACTORY = "0x477ce834ae6b7ab003cce4bc4d8697763ff456fa";



const dexTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  await tvlOnPairs("polygon", chainBlocks, FACTORY, balances);
  return balances;
};




const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["polygon"];
  let balances = {};
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
  methodology: "TVL counts liquidity in the AMM found using the factory address(0x477ce834ae6b7ab003cce4bc4d8697763ff456fa) and the TVL in the vaults that is tracked using the vaultChef contract(0xBdA1f897E851c7EF22CD490D2Cf2DAce4645A904).",
  tvl: sdk.util.sumChainTvls([polygonTvl, dexTvl]),
};