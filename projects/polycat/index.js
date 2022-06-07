const sdk = require("@defillama/sdk");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const factory = "0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA";
const vaultchef = "0xBdA1f897E851c7EF22CD490D2Cf2DAce4645A904";
const tankchef = "0xfaBC099AD582072d26375F65d659A3792D1740fB";
const fish = "0x3a3df212b7aa91aa0402b9035b098891d276572b";
const paw = "0xbc5b59ea1b6f8da8258615ee38d40e999ec5d74f";
const WMATIC = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"

const convert = {
  "0x61bdd9c7d4df4bf47a4508c0c8245505f2af5b7b":"0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
  "0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b":"avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  "0x4eac4c4e9050464067d673102f8e24b2fcceb350":"0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f",
  "0x845e76a8691423fbc4ecb8dd77556cb61c09ee25":"bsc:0x0487b824c8261462f88940f97053e65bdb498446",
  "0x6971aca589bbd367516d70c3d210e4906b090c96":"polygon:0xbc5b59ea1b6f8da8258615ee38d40e999ec5d74f",
  "0xacd7b3d9c10e97d0efa418903c0c7669e702e4c0":"bsc:0xacd7b3d9c10e97d0efa418903c0c7669e702e4c0",
  "0x3053ad3b31600074e9a90440770f78d5e8fc5a54":"bsc:0xb64e638e60d154b43f660a6bf8fd8a3b249a6a21",
  "0x4a592de6899ff00fbc2c99d7af260b5e7f88d1b4":"0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
  "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171":"0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
  "0xb4d09ff3da7f9e9a2ba029cb0a81a989fd7b8f17":"0x6c3f90f043a72fa612cbac8115ee7e52bde6e490"
}

async function vaulttvl(timestamp, block, chainBlocks) {
  const chain = "polygon";
  let balances = {};
  
  await calcVaultTvl(balances, chainBlocks.polygon, vaultchef, false);
  return balances;
}

async function calcVaultTvl(balances, block, vaultchef, pool2) {
  const chain = "polygon";
  let poolLength = (await sdk.api.abi.call({
    target: vaultchef,
    abi: abi["poolLength"],
    block,
    chain
  })).output;
  poolLength = Number(poolLength);

  const poolInfos = (await sdk.api.abi.multiCall({
    calls: Array.from({length: poolLength}, (_, k) => ({
      target: vaultchef,
      params: k
    })),
    abi: abi["poolInfo"],
    block,
    chain
  })).output;

  const wantLockedTotals = (await sdk.api.abi.multiCall({
    calls: poolInfos.map(p => ({
      target: p.output.strat
    })),
    abi: abi["wantLockedTotal"],
    block,
    chain
  })).output;

  let withBalance = [];

  for (let i = 0; i < poolLength; i++) {
    if (Number(wantLockedTotals[i].output) === 0) continue;
    withBalance.push([poolInfos[i].output.want.toLowerCase(), wantLockedTotals[i].output]);
  } 

  const wantSymbols = (await sdk.api.abi.multiCall({
    calls: withBalance.map(p => ({
      target: p[0]
    })),
    abi: "erc20:symbol",
    block,
    chain
  })).output;

  let lps = [];

  for (let i = 0; i < withBalance.length; i++) {
    const symbol = wantSymbols[i].output;
    const balance = withBalance[i][1];
    const token = withBalance[i][0];
    if (token === paw || token === fish) continue;
    if (symbol.endsWith("UNI-V2") || symbol.endsWith("LP")) {
      lps.push([token, balance]);
      continue;
    }
    if (pool2) continue;
    if (convert[token] !== undefined) {
      sdk.util.sumSingleBalance(balances, convert[token], balance);
      continue;
    }
    sdk.util.sumSingleBalance(balances, `polygon:${token}`, balance);
  }

  const lpToken0 = (await sdk.api.abi.multiCall({
    calls: lps.map(p => ({
      target: p[0]
    })),
    abi: abi["token0"],
    block,
    chain
  })).output;

  const lpToken1 = (await sdk.api.abi.multiCall({
    calls: lps.map(p => ({
      target: p[0]
    })),
    abi: abi["token1"],
    block,
    chain
  })).output;

  let lpPositions = [];

  for (let i = 0; i < lps.length; i++) {
    const token0 = lpToken0[i].output.toLowerCase();
    const token1 = lpToken1[i].output.toLowerCase();
    if (pool2) {
      if (token0 === fish || token1 === fish || token0 === paw || token1 === paw) {
        lpPositions.push({token: lps[i][0], balance: lps[i][1]});
      }
    }
    else if (!pool2) {
      if (token0 !== fish && token1 !== fish && token0 !== paw && token1 !== paw) {
        lpPositions.push({token: lps[i][0], balance: lps[i][1]});
      }
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block, chain, addr=>{
    addr = addr.toLowerCase();
    if (convert[addr] !== undefined) {
      return convert[addr];
    }
    return `polygon:${addr}`
  })
}

async function pool2(timestamp, block, chainBlocks) {
  let balances = {};
  await calcVaultTvl(balances, chainBlocks.polygon, vaultchef, true);
  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  const stakedBalances = (await sdk.api.abi.multiCall({
    calls: [
      {
        target: paw,
        params: tankchef
      },
      {
        target: fish,
        params: "0x640328B6BB1856dDB6a7d7BB07e5E1F3D9F50B94"
      }
    ],
    abi: "erc20:balanceOf",
    block: chainBlocks.polygon,
    chain: "polygon"
  })).output;

  stakedBalances.forEach(p => {
    sdk.util.sumSingleBalance(balances, `polygon:${p.input.target}`, p.output);
  });
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL are from the pools created by the factory and TVL in vaults",
  polygon: {
    tvl: sdk.util.sumChainTvls([calculateUsdUniTvl(factory,"polygon",WMATIC,["0x2791bca1f2de4661ed88a30c99a7a9449aa84174","0xc2132d05d31c914a87c6611c10748aeb04b58e8f","0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"],"wmatic"),vaulttvl]),
    pool2,
    staking
  }
}
  

