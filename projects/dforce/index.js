/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require('bignumber.js');
  const abi = require('./abi.json');

/*==================================================
  Settings
  ==================================================*/
  const BUSD = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
  const DAI  = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const DF   = '0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0';
  const GOLDx= '0x355C665e101B9DA58704A8fDDb5FeeF210eF20c0';
  const HUSD = '0xdF574c24545E5FfEcb9a659c229253D4111d87e1';
  const HBTC = '0x0316EB71485b0Ab14103307bf65a021042c6d380';
  const PAX  = '0x8E870D67F660D95d5be530380D0eC0bd388289E1';
  const UNI  = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
  const TUSD = '0x0000000000085d4780B73119b644AE5ecd22b376';
  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const USDx = '0xeb269732ab75A6fD61Ea60b06fE994cD32a83549';
  const wETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

/*==================================================
USDx
==================================================*/

const usdxReservedTokens = [PAX, TUSD, USDC];
const dUSDC = '0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179';

const usdxPool = '0x7FdcDAd3b4a67e00D9fD5F22f4FD89a5fa4f57bA' // USDx Stablecoin Pool

/*==================================================
dToken Protocol
==================================================*/
const yieldMarkets = [
  '0x02285AcaafEB533e03A7306C55EC031297df9224', // dDAI
  '0xF4dFc3Df8C83Be5a2ec2025491fd157c474f438a', // dPAX
  '0x55BCf7173C8840d5517424eD19b7bbF11CFb9F2B', // dTUSD
  '0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179', // dUSDC
  '0x868277d475E0e475E38EC5CdA2d9C83B5E1D9fc8', // dUSDT
]

const yieldUnderlyingTokens = {
  '0x02285AcaafEB533e03A7306C55EC031297df9224': DAI,
  '0xF4dFc3Df8C83Be5a2ec2025491fd157c474f438a': PAX,
  '0x55BCf7173C8840d5517424eD19b7bbF11CFb9F2B': TUSD,
  '0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179': USDC,
  '0x868277d475E0e475E38EC5CdA2d9C83B5E1D9fc8': USDT,
}


/*==================================================
  GOLDx Protocol
  ==================================================*/
  goldxReserve  = '0x45804880De22913dAFE09f4980848ECE6EcbAf78'  // PAXG
  goldxProtocol = '0x355C665e101B9DA58704A8fDDb5FeeF210eF20c0'  // GOLDx

/*==================================================
  iToken Lending Protocol
  ==================================================*/
  const lendingMarkets = [
    '0x24677e213DeC0Ea53a430404cF4A11a6dc889FCe', // iBUSD
    '0x298f243aD592b6027d4717fBe9DeCda668E3c3A8', // iDAI
    '0xb3dc7425e63E1855Eb41107134D471DD34d7b239', // iDF
    '0x5ACD75f21659a59fFaB9AEBAf350351a8bfaAbc0', // iETH
    '0x164315EA59169D46359baa4BcC6479bB421764b6', // iGOLDx
    '0x47566acD7af49D2a192132314826ed3c3c5f3698', // iHBTC
    '0xbeC9A824D6dA8d0F923FD9fbec4FAA949d396320', // iUNI
    '0x2f956b2f801c6dad74E87E7f45c94f6283BF0f45', // iUSDC
    '0x1180c114f7fAdCB6957670432a3Cf8Ef08Ab5354', // iUSDT
    '0x5812fCF91adc502a765E5707eBB3F36a07f63c02', // iWBTC
  ]

  const lendingUnderlyingTokens = {
    '0x24677e213DeC0Ea53a430404cF4A11a6dc889FCe': BUSD,
    '0x298f243aD592b6027d4717fBe9DeCda668E3c3A8': DAI,
    '0xb3dc7425e63E1855Eb41107134D471DD34d7b239': DF,
    '0x5ACD75f21659a59fFaB9AEBAf350351a8bfaAbc0': wETH,
    '0x164315EA59169D46359baa4BcC6479bB421764b6': GOLDx,
    '0x47566acD7af49D2a192132314826ed3c3c5f3698': HBTC,
    '0xbeC9A824D6dA8d0F923FD9fbec4FAA949d396320': UNI,
    '0x2f956b2f801c6dad74E87E7f45c94f6283BF0f45': USDC,
    '0x1180c114f7fAdCB6957670432a3Cf8Ef08Ab5354': USDT,
    '0x5812fCF91adc502a765E5707eBB3F36a07f63c02': WBTC,
  }

/*==================================================
TVL
==================================================*/

async function tvl(timestamp, block) {
  let balances = {};

  let assetsCalls = _.map(usdxReservedTokens, (token) => ({
    target: token,
    params: usdxPool
  }));

  assetsCalls.push({
    target: goldxReserve,
    params: goldxProtocol
  });

  let assetsBalanceResults = await sdk.api.abi.multiCall({
    block,
    calls: assetsCalls,
    abi: 'erc20:balanceOf'
  });

  sdk.util.sumMultiBalanceOf(balances, assetsBalanceResults);

  let usdxRemainingUSDC = (await sdk.api.abi.call({
    target: dUSDC,
    params: usdxPool,
    abi: abi['balanceOfUnderlying']
  })).output;

  balances[USDC] = BigNumber(balances[USDC] || 0).plus(usdxRemainingUSDC).toFixed();

  await (
    Promise.all(yieldMarkets.map(async (yieldMarket) => {
      try {
        let marketTVL = (await sdk.api.abi.call({
          block,
          target: yieldMarket,
          abi: abi['getBaseData']
        })).output;

        const _balance = marketTVL['4'] || 0;

        balances[yieldUnderlyingTokens[yieldMarket]] = BigNumber(balances[yieldUnderlyingTokens[yieldMarket]] || 0)
          .plus(_balance)
          .toFixed();
      } catch (error) {
        console.error(error)
      }
    }))
  );

  // Get iToken lending protocols locked
  let iTokenLocked = await sdk.api.abi.multiCall({
    block,
    calls: _.map(lendingMarkets, (market) => ({
      target: market,
    })),
    abi: abi['getCash'],
  });

  _.each(iTokenLocked.output, (lockedDetails) => {
    let asset = lendingUnderlyingTokens[lockedDetails.input.target];
    balances[asset] = BigNumber(balances[asset] || 0).plus(lockedDetails.output || 0).toFixed()
  });

  return balances;
}

module.exports = {
  name: 'dForce',
  token: 'DF',
  category: 'assets',
  start: 1564165044, // Jul-27-2019 02:17:24 AM +UTC
  tvl
}