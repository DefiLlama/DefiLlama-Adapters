const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { compoundExports } = require("../helper/compound");
const { staking } = require("../helper/staking.js");
const { getPoolInfo } = require("../helper/masterchef.js");
const { transformBscAddress } = require("../helper/portedTokens");

const replacements = {
  "0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C":
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //beltBNB -> wbnb
  "0x9cb73F20164e399958261c289Eb5F9846f4D1404":
    "0x55d398326f99059ff775485246999027b3197955", // 4belt -> usdt
  "0x51bd63F240fB13870550423D208452cA87c44444":
    "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //beltBTC->
  "0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25":
    "0x2170ed0880ac9a755fd29b2688956bd959f933f8", //beltETH->
};

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
    };
  };

  await unwrapUniswapLPs(
    balances,
    lps,
    chainBlocks.bsc,
    "bsc",
    transform
  );

  return balances;
};

// node test.js projects/planet-finance/index.js
module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([tvl, compoundExports(
      '0xF54f9e7070A1584532572A6F640F09c606bb9A83',
      'bsc',
      '0x24664791B015659fcb71aB2c9C0d56996462082F',
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    ).tvl]),
    staking: staking(
      "0xb7eD4A5AF620B52022fb26035C565277035d4FD7",
      "0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991",
      "bsc",
      ),
    borrowed: compoundExports(
      '0xF54f9e7070A1584532572A6F640F09c606bb9A83',
      'bsc',
      '0x24664791B015659fcb71aB2c9C0d56996462082F',
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    ).borrowed
  },
};