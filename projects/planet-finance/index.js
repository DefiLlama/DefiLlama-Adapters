const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");
const { getPoolInfo } = require("../helper/masterchef.js");
const { transformBscAddress } = require("../helper/portedTokens");

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

// liquidity pools
async function tvl(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const lps = [];
  const transform = await transformBscAddress();

  const [poolInfo1, poolInfo2] = await Promise.all([
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
  ]);
  const allPoolInfos = poolInfo1.concat(poolInfo2);

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

    } else {
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

  return balances;
}


// node test.js projects/planet-finance/index.js
module.exports = {
  doublecounted: true,
  bsc: {
    tvl,
    staking: staking(
      "0xb7eD4A5AF620B52022fb26035C565277035d4FD7",
      "0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991",
      "bsc",
    )
  },
};
