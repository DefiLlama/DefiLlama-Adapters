const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const { getTokenPriceCoinGecko } = require("../config/bella/utilities.js");


const BigNumber = require("bignumber.js");

// contract
const YUMYearn = '0x5cefb9f7c53a1b0c78e239b2445ddd2d362b7076';
const YUMIdle = '0x894CcdBED28E294482fECf10eAC5962148bf4E15';
const Collector = '0x219de705e6c22d6fbc27446161efcc7d5d055ecb';
const StakingPools = '0x0EdA8090E9A86668484915e5E1856E83480FA010';

// token
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f';
const WASABI = '0x896e145568624a498c5a909187363AE947631503';
const WASABILP = '0x8f9ef75cd6e610dd8acf8611c344573032fb9c3d';
const WAUSD = '0xc2db4c131adaf01c15a1db654c040c8578929d55';
const WAUSD3CRV = '0x9f6664205988c3bf4b12b851c075102714869535';
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';




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
        }
      ],
      abi: abi['totalDeposited'],
      block: block
    });

    // yum - yearn
    const YUMYearnTVL = resultYUM.output[0];

    // yum - idle
    const YUMIdleTVL = resultYUM.output[1];


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
        }
      ],
      abi: abi['balanceOf'],
      block: block
    });

    // pool - wasabi
    const PoolWasabiTVL = resultBalance.output[0];

    // pool - lp
    const stakedLP = resultBalance.output[1];

    const totalLP = await sdk.api.abi.call({
      target: WASABILP,
      abi: abi['totalSupply'],
      block: block
    });

    const shareOfTotalStaked = new BigNumber(totalLP.output).div(new BigNumber(stakedLP.output));

    const totalWETHinLP = resultBalance.output[2];

    // times 2 for wasabi + weth
    const totalWETHShareInLP = shareOfTotalStaked.times(new BigNumber(totalWETHinLP.output)).times(2);

    // pool - Wausd
    const PoolWAUSDTVL = resultBalance.output[3];

    // pool - wausd3crv
    const PoolWAUSD3CRVTVL = resultBalance.output[4];

    //DAI = Dai in YUMYearn + Dai in YUMIdle + waUSD in StakingPools + WAUSD3CRV in StakingPools + WASABI in stakingPools * WASABI price in usd

    balances['DAI'] =  (new BigNumber(YUMYearnTVL.output)
                        .plus(new BigNumber(YUMIdleTVL.output))
                        .plus(new BigNumber(PoolWAUSDTVL.output))
                        .plus(new BigNumber(PoolWAUSD3CRVTVL.output)))
                        .plus(new BigNumber(PoolWasabiTVL.output).times(baseTokenPriceInUsd))
                        .div(1e18);

    // WETH = WETH in LP(staked) + WASABI in LP(staked)
    balances['WETH'] = totalWETHShareInLP.div(1e18);

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
