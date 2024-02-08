const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const abiNew = require("./abiNew.json");
const abiV3 = require("./abiV3.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");
const { getPoolInfo } = require("../helper/masterchef.js");

const replacements = {
  [ADDRESSES.bsc.beltBNB]:
    ADDRESSES.bsc.WBNB, //beltBNB -> wbnb
  [ADDRESSES.bsc.Belt4]:
    ADDRESSES.bsc.USDT, // 4belt -> usdt
  [ADDRESSES.bsc.beltBTC]:
    ADDRESSES.bsc.BTCB, //beltBTC->
  [ADDRESSES.bsc.beltETH]:
    ADDRESSES.bsc.ETH, //beltETH->
};

const transform = i => `bsc:${i}`;
// liquidity pools
async function tvl(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const lps = [];
  const thenaLps = [];
  const transform = i => `bsc:${i}`;

  const [ poolInfo1, poolInfo2, poolInfo3, poolInfo4] = await Promise.all([
    await getPoolInfo(
      "0x0ac58Fd25f334975b1B61732CF79564b6200A933",
      chainBlocks.bsc,
      "bsc",
      abi.poolInfo
    ), // aquaFarm
    await getPoolInfo(
      "0xB87F7016585510505478D1d160BDf76c1f41b53d",
      chainBlocks.bsc,
      "bsc",
      abi.poolInfo
    ),  // newFarm
    await getPoolInfo(
      "0x9EBce8B8d535247b2a0dfC0494Bc8aeEd7640cF9",
      chainBlocks.bsc,
      "bsc",
      abiNew.poolInfo
    ),  // newFarm
    await getPoolInfo(
      "0x405960AEAad7Ec8B419DEdb511dfe9D112dFc22d",
      chainBlocks.bsc,
      "bsc",
      abiV3.poolInfo
    ),  // v3 Farm
  ]);
  let allPoolInfos = poolInfo1.concat(poolInfo2).concat(poolInfo3).concat(poolInfo4);

  allPoolInfos = allPoolInfos.filter(function (el) {
    return el.output.want != "0xC9440dEb2a607A6f6a744a9d142b16eD824A1A3b";
  });

  const [poolTvl, wantSymbol] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: allPoolInfos.map(p => ({
        target: p.output.strat
      })),
      abi: abi.wantLockedTotal,
      chain: "bsc",
      block: chainBlocks.bsc,
    }),
    sdk.api.abi.multiCall({
      calls: allPoolInfos.map(p => ({
        target: p.output.want
      })),
      abi: "erc20:symbol",
      chain: "bsc",
      block: chainBlocks.bsc,
    })
  ]);


  for (let i = 0; i < poolTvl.output.length; i++) {
    if (wantSymbol.output[i].output.endsWith("LP")) {
      lps.push({
        token: allPoolInfos[i].output.want,
        balance: poolTvl.output[i].output,
      });
    } else if (wantSymbol.output[i].output.indexOf("a") == 0) {
      thenaLps.push({
        token: allPoolInfos[i].output.want,
        balance: poolTvl.output[i].output,
      });
    }else {
      const addr = replacements[allPoolInfos[i].output.want]
        ?? allPoolInfos[i].output.want;
      sdk.util.sumSingleBalance(
        balances,
        transform(addr),
        poolTvl.output[i].output
      );
    }
  }

  await unwrapUniswapLPs(
    balances,
    lps,
    chainBlocks.bsc,
    "bsc",
    transform
  );

  await thenaTvl(timestamp, chainBlocks, thenaLps, balances);

  return balances;
}

async function thenaTvl(timestamp, chainBlocks, thenaLps, balances) {
  const vaultCalls = thenaLps.map(v => ({ target: v.token }))

  const { output: vaultAmts } = await sdk.api.abi.multiCall({ 
    abi: abiV3.getTotalAmounts, 
    calls: vaultCalls, 
    chain: "bsc",
    block: chainBlocks.bsc,
  })

  const { output: token0 } = await sdk.api.abi.multiCall({ 
    abi: abiV3.token0, 
    calls: vaultCalls, 
    chain: "bsc",
    block: chainBlocks.bsc, 
  })
  const { output: token1 } = await sdk.api.abi.multiCall({ 
    abi: abiV3.token1, 
    calls: vaultCalls, 
    chain: "bsc",
    block: chainBlocks.bsc
  })

  const { output: totalSupplies } = await sdk.api.abi.multiCall({ 
    abi: abiV3.totalSupply, 
    calls: vaultCalls, 
    chain: "bsc",
    block: chainBlocks.bsc
  })

  vaultAmts.map((vaultAmt, i) => {
    const ratio = thenaLps[i].balance/ totalSupplies[i].output;
    sdk.util.sumSingleBalance(balances, transform(token0[i].output), ratio * vaultAmt.output.total0);
    sdk.util.sumSingleBalance(balances, transform(token1[i].output) , ratio * vaultAmt.output.total1);
  })

  return balances;
}


// node test.js projects/planet-finance/index.js
module.exports = {
  doublecounted: true,
  bsc: {
    tvl,
    staking: staking(
      "0x60A895073AdC0e5F5a22C60bdfc584D79B5219a1",
      "0xb3cb6d2f8f2fde203a022201c81a96c167607f15",
      "bsc",
    )
  },
};
