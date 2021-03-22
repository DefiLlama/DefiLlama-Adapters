/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require('bignumber.js');
  const abi = require('./abi');

  const lendingReserves = [
    '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // BUSD
    '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215', // CHAI(DAI)
    '0x0316EB71485b0Ab14103307bf65a021042c6d380', // HBTC
    '0xdF574c24545E5FfEcb9a659c229253D4111d87e1', // HUSD
    '0x3212b29E33587A00FB1C83346f5dBFA69A458923', // imBTC
    '0x8E870D67F660D95d5be530380D0eC0bd388289E1', // PAX
    '0x0000000000085d4780B73119b644AE5ecd22b376', // TUSD
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0xeb269732ab75A6fD61Ea60b06fE994cD32a83549', // USDx
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  ]
  const lendingMarket = '0x0eEe3E3828A45f7601D5F54bF49bB01d1A9dF5ea' // market

/*==================================================
  Settings
  ==================================================*/
    const BUSD = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
    const DAI  = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    const HUSD = '0xdF574c24545E5FfEcb9a659c229253D4111d87e1';
    const PAX  = '0x8E870D67F660D95d5be530380D0eC0bd388289E1';
    const TUSD = '0x0000000000085d4780B73119b644AE5ecd22b376';
    const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const USDx = '0xeb269732ab75A6fD61Ea60b06fE994cD32a83549';

  /*==================================================
  USDx
  ==================================================*/

  const usdxReservedTokens = [PAX, TUSD, USDC]

  const usdxPool = '0x786bF554473f9aB733Fd683C528212492A23D895' // USDx Stablecoin Pool

  /*==================================================
  xSwap Protocol
  ==================================================*/
  const swapPoolReserves = [BUSD, DAI, HUSD, PAX, TUSD, USDC, USDT, USDx]

  const swapPool = '0x03eF3f37856bD08eb47E2dE7ABc4Ddd2c19B60F2' // xSwap

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
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {};

    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: _.map(lendingReserves, (reserve) => ({
        target: reserve,
        params: lendingMarket
      })),
      abi: 'erc20:balanceOf'
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults);

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

    let swapBalanceResults = await sdk.api.abi.multiCall({
      block,
      calls: _.map(swapPoolReserves, (token) => ({
          target: token,
          params: swapPool
        })),
      abi: 'erc20:balanceOf'
    });

    sdk.util.sumMultiBalanceOf(balances, swapBalanceResults);

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

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'dForce',
    token: 'DF',
    category: 'assets',
    start: 1564165044, // Jul-27-2019 02:17:24 AM +UTC
    tvl
  }
