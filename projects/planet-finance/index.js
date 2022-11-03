const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const abiNew = require("./abiNew.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
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

const gammaInifnityVaultStratAddress = "0xA160F381EA8B3a4EcF32273b7a73393fCdA57aa7";
const gGammaAddress = "0xCD221e1504442671671D3330CB8E916a5EDc3FC7";

const aquaInifnityVaultStratAddress = "0xddd0626BB795BdF9CfA925da5102eFA5E7008114";
const gAquaAddress = "0x2f5d7A9D8D32c16e41aF811744DB9f15d853E0A5";



// liquidity pools
async function tvl(timestamp, ethBlock, chainBlocks) {
  const gGammaTokenExchangeRate = (await sdk.api.abi.call({
    target: gGammaAddress,
    abi: abi.exchangeRateStored,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;

  const gAquaTokenExchangeRate = (await sdk.api.abi.call({
    target: gAquaAddress,
    abi: abi.exchangeRateStored,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  
  console.log('gTokenExchangeRate', gGammaTokenExchangeRate, gAquaTokenExchangeRate);

  let balances = {};
  const lps = [];
  const transform = await transformBscAddress();

  const [poolInfo1, poolInfo2, poolInfo3] = await Promise.all([
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
  ]);
  const allPoolInfos = poolInfo1.concat(poolInfo2).concat(poolInfo3);
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

  //console.log('poolTvl', poolTvl.output);

  for (let i = 0; i < poolTvl.output.length; i++) {
    if (wantSymbol.output[i].output.endsWith("LP")) {
      lps.push({
        token: allPoolInfos[i].output.want,
        balance: poolTvl.output[i].output,
      });

    } else {
      const addr = replacements[allPoolInfos[i].output.want]
        ?? allPoolInfos[i].output.want;
      //const addr = allPoolInfos[i].output.want;
      let bal = poolTvl.output[i].output

      //balance in gamma infinity vault
      if(allPoolInfos[i].output.strat.toLowerCase() == gammaInifnityVaultStratAddress.toLowerCase()) {
        bal = (
          (poolTvl.output[i].output * gGammaTokenExchangeRate) /
          1e18
        ).toLocaleString("fullwide", { useGrouping: false });
        console.log('bal', bal);
      }

      //balance in aqua infinity vault
      if(allPoolInfos[i].output.strat.toLowerCase() == aquaInifnityVaultStratAddress.toLowerCase()) {
        bal = (
          (poolTvl.output[i].output * gAquaTokenExchangeRate) /
          1e18
        ).toLocaleString("fullwide", { useGrouping: false });
        console.log('bal', bal);
      }

      sdk.util.sumSingleBalance(
        balances,
        transform(addr),
        bal
      );
    };
  };
  console.log('balances', balances);

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
  doublecounted: true,
  bsc: {
    tvl,
    staking: staking(
      "0x2f5d7A9D8D32c16e41aF811744DB9f15d853E0A5",
      "0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991",
      "bsc",
    )
  },
};
