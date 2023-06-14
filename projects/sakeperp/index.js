const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const ethSake = "0x066798d9ef0833ccc719076Dab77199eCbd178b0";
const ethFactory = "0x75e48C954594d64ef9613AeEF97Ad85370F13807";
const ethSakebar = "0x5fe808a4889b714496E7b821c8542e26be2f8f67";
const bscSake = "0x8BD778B12b15416359A227F0533Ce2D91844e1eD";
const bscFactory = "0xA534cf041Dcd2C95B4220254A0dCb4B905307Fd8";
const bscSakebar = "0xbC83FAdA7D0881F772daaB2B4295F949FA309B59";
const perpVault = "0xa34dA41edB2b15A20893d2208377E24D8dcdeB6e";
const bUsd = ADDRESSES.bsc.BUSD;

async function tvl(factory, block, chain) {
  let balances = {};
  let poolsLength = (
    await sdk.api.abi.call({
      target: factory,
      abi: abi.allPairsLength,
      block,
      chain,
    })
  ).output;
  let allPools = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(poolsLength) }, (_, k) => ({
        target: factory,
        params: k,
      })),
      abi: abi.allPairs,
      block,
      chain,
    })
  ).output;
  let reserves = (
    await sdk.api.abi.multiCall({
      calls: allPools.map((p) => ({
        target: p.output,
      })),
      abi: abi.getReserves,
      block,
      chain,
    })
  ).output;
  let token0s = (
    await sdk.api.abi.multiCall({
      calls: allPools.map((p) => ({
        target: p.output,
      })),
      abi: abi.token0,
      block,
      chain,
    })
  ).output;
  let token1s = (
    await sdk.api.abi.multiCall({
      calls: allPools.map((p) => ({
        target: p.output,
      })),
      abi: abi.token1,
      block,
      chain,
    })
  ).output;
  for (let i = 0; i < reserves.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      `${chain}:${token0s[i].output}`,
      reserves[i].output._reserve0
    );
    sdk.util.sumSingleBalance(
      balances,
      `${chain}:${token1s[i].output}`,
      reserves[i].output._reserve1
    );
  }
  return balances;
}

async function staking(sake, sakebar, block, chain) {
  let balances = {};
  let balance = (
    await sdk.api.erc20.balanceOf({
      target: sake,
      owner: sakebar,
      block,
      chain,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, `${chain}:${sake}`, balance);
  return balances;
}

async function ethTvl(timestamp, block) {
  return await tvl(ethFactory, block, "ethereum");
}

async function bscTvl(timestamp, block, chainBlocks) {
  return await tvl(bscFactory, chainBlocks.bsc, "bsc");
}

async function ethStaking(timestamp, block) {
  return await staking(ethSake, ethSakebar, block, "ethereum");
}

async function bscStaking(timestamp, block, chainBlocks) {
  return await staking(bscSake, bscSakebar, chainBlocks.bsc, "bsc");
}

async function perpVaultTvl(timestamp, block, chainBlocks) {
  return await staking(bUsd, perpVault, chainBlocks.bsc, "bsc");
}

module.exports = {
  methodology:
    "TVL consists of pools in the factory contract and the BUSD in the PerpVault contract. Staking consists of SAKE in SakeBar.",
  ethereum: {
    tvl: ethTvl,
    staking: ethStaking,
  },
  bsc: {
    tvl: sdk.util.sumChainTvls([bscTvl, perpVaultTvl]),
    staking: bscStaking,
  },
};
