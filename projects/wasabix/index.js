const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const { getTokenPriceCoinGecko } = require("../config/bella/utilities.js");


const BigNumber = require("bignumber.js");

// contract
const YUMYearn = '0x5cefb9f7c53a1b0c78e239b2445ddd2d362b7076';
const YUMIdle = '0x894CcdBED28E294482fECf10eAC5962148bf4E15';
const YUMPickle = '0x2de9441c3e22725474146450fc3467a2c778040f';
const YUMVesper = '0x26a70759222b1842A7c72215F64C7FdE8Db24856';
const YUMLiquity = '0x55c75414F525Ef9ccbb8105Ce083EDbDA0075FB5';
const YUMVesperETH = '0xB642eb5Faf7e731Ff62823515b3fF82B45d385bC';

const Collector = '0x219de705e6c22d6fbc27446161efcc7d5d055ecb';
const CollectorBTC = '0x68e91DF501ab66A0796d0fd164B907Acf5f89AD0';
const CollectorLUSD = '0xB208dec45eDBD1179d9e275C5D459E6282d606ea';
const CollectorWETH = '0x7Ee64F74792c307446CD92D23E551EfAE3172A28';

const StakingPools = '0x0EdA8090E9A86668484915e5E1856E83480FA010';

// token
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f';
const WASABI = '0x896e145568624a498c5a909187363AE947631503';
const WASABILP = '0x8f9ef75cd6e610dd8acf8611c344573032fb9c3d';
const WAUSD = '0xc2db4c131adaf01c15a1db654c040c8578929d55';
const WAUSD3CRV = '0x9f6664205988c3bf4b12b851c075102714869535';
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const WABTC = '0xfd8e70e83e399307db3978d3f34b060a06792c36';
const WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const LUSD = '0x5f98805a4e8be255a32880fdec7f6728c6568ba0';
const WALUSD = '0xcbf335Bb8eE86A5A88bEbCda4506a665aA8d7022';
const WAETH = '0x6a1fbefdF67445C7F531b4F3e04Ffb37b7b13794';

async function tvl(timestamp, block) {
    let balances = {};
    const baseTokenPriceInUsd = await getTokenPriceCoinGecko("usd")("wasabix");

    let resultYUM = await sdk.api.abi.multiCall({
      calls: [
        {
          target: YUMYearn,
        },
        {
          target: YUMIdle
        },
        {
          target: YUMPickle
        },
        {
          target: YUMVesper
        },
        {
          target: YUMLiquity
        },
        {
          target: YUMVesperETH
        }
      ],
      abi: abi['totalDeposited'],
      block: block
    });

    // yum - yearn
    const YUMYearnTVL = resultYUM.output[0];

    // yum - idle
    const YUMIdleTVL = resultYUM.output[1];

    // yum - pickle
    const YUMPickleTVL = resultYUM.output[2];

    // yum - vesper
    const YUMVesperTVL = resultYUM.output[3];

    // yum - liquity
    const YUMLiquityTVL = resultYUM.output[4];

    // yum - vesperETH
    const YUMVesperETHTVL = resultYUM.output[5];

    let resultBalance = await sdk.api.abi.multiCall({
      calls: [
        {
          target: WASABI,
          params: StakingPools
        },
        {
          target: WASABILP,
          params: StakingPools
        },
        {
          target: WETH,
          params: WASABILP
        },
        {
          target: WAUSD,
          params: StakingPools
        },
        {
          target: WAUSD3CRV,
          params: StakingPools
        },
        {
          target: WABTC,
          params: StakingPools
        },
        {
          target: WALUSD,
          params: StakingPools
        },
        {
          target: WAETH,
          params: StakingPools
        },
        {
          target: DAI,
          params: Collector
        },
        {
          target: WBTC,
          params: CollectorBTC
        },
        {
          target: LUSD,
          params: CollectorLUSD
        },
        {
          target: WETH,
          params: CollectorWETH
        }
      ],
      abi: abi['balanceOf'],
      block: block
    });

    // pool - wasabi
    const PoolWasabiTVL = resultBalance.output[0];

    // pool - Wausd
    const PoolWAUSDTVL = resultBalance.output[3];

    // pool - wausd3crv
    const PoolWAUSD3CRVTVL = resultBalance.output[4];

    // pool - waBTC
    const PoolWABTCTVL = resultBalance.output[5];

    // pool - waLUSD
    const PoolWALUSDTVL = resultBalance.output[6];

    // pool - waETH
    const PoolWAETHTVL = resultBalance.output[7];

    // collector - DAI
    const CollectorDAITVL = resultBalance.output[8];

    // collector - WBTC
    const CollectorWBTCTVL = resultBalance.output[9];

    // collector - LUSD
    const CollectorLUSDTVL = resultBalance.output[10];

    // collector - WETH
    const CollectorWETHTVL = resultBalance.output[11];

    //DAI = Dai in YUMYearn + Dai in YUMIdle + Dai in YUMPickle + LUSD in YUMLiquity + Dai in Collector + LUSD in Collector + waUSD in StakingPools + waLUSD in StakingPools + WAUSD3CRV in StakingPools + WASABI in stakingPools * WASABI price in usd
    balances['DAI'] =  (new BigNumber(YUMYearnTVL.output)
                        .plus(new BigNumber(YUMIdleTVL.output))
                        .plus(new BigNumber(YUMPickleTVL.output))
                        .plus(new BigNumber(YUMLiquityTVL.output))
                        .plus(new BigNumber(CollectorDAITVL.output))
                        .plus(new BigNumber(CollectorLUSDTVL.output))
                        .plus(new BigNumber(PoolWAUSDTVL.output))
                        .plus(new BigNumber(PoolWALUSDTVL.output))
                        .plus(new BigNumber(PoolWAUSD3CRVTVL.output)))
                        .plus(new BigNumber(PoolWasabiTVL.output).times(baseTokenPriceInUsd))
                        .div(1e18)

    balances['Bitcoin'] = (new BigNumber(YUMVesperTVL.output)
                          .plus(new BigNumber(CollectorWBTCTVL.output))
                          .plus(new BigNumber(PoolWABTCTVL.output))).div(1e8);

    balances['Ethereum'] = (new BigNumber(YUMVesperETHTVL.output)
                          .plus(new BigNumber(CollectorWETHTVL.output))
                          .plus(new BigNumber(PoolWAETHTVL.output))).div(1e18);

    return balances;
}

module.exports = {
  name: 'Wasabix',               // project name
  website: 'https://wasabix.finance',
  token: 'WASABI',
  category: 'yield',          // yield
  start: 1616400600,
  tvl                           // tvl adapter
}
