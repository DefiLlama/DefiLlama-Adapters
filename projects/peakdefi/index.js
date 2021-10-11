/*==================================================
  Modules
  ==================================================*/

  const _ = require('underscore');
  const sdk = require("@defillama/sdk")
  const BigNumber = require('bignumber.js');

 /*==================================================
  Settings
  ==================================================*/

  const zeroAddress = '0x0000000000000000000000000000000000000000'
  const peakAddress = '0x630d98424eFe0Ea27fB1b3Ab7741907DFFEaAd78'

  const funds = {
    globalFund: {
      address: '0x07cDB44fA1E7eCEb638c12A3451A3Dc9CE1400e4',
      tokens: [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
        '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
        '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
        '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
        '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E',
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
        '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55',
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        '0x607F4C5BB672230e8672085532f7e901544a7375',
        '0x8400D94A5cb0fa0D041a3788e395285d61c9ee5e',
        '0xD46bA6D942050d489DBd938a2C909A5d5039A161',
        '0x408e41876cCCDC0F92210600ef50372656052a38',
        '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
        '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        '0xD9Ec3ff1f8be459Bb9369b4E79e9Ebcf7141C093',
        '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892',
        '0x8762db106B2c2A0bccB3A80d1Ed41273552616E8',
        '0x0000000000085d4780B73119b644AE5ecd22b376',
        '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
        '0xfeF4185594457050cC9c23980d301908FE057Bb1',
        '0x4a220E6096B25EADb88358cb44068A3248254675',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
        '0xD533a949740bb3306d119CC777fa900bA034cd52',
        '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
        '0x2ba592F78dB6436527729929AAf6c908497cB200',
        '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
        '0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0',
        '0xaAAf91D9b90dF800Df4F55c205fd6989c977E73a',
        '0x0E8d6b471e332F140e7d9dbB99E5E3822F728DA6',
        '0x960b236A07cf122663c4303350609A66A7B288C0',
      ]
    },
    nftFund: {
      address: '0xC120C7dB0804ae3AbEB1d5f9c9C70402347B4685',
      tokens: [
        '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',
        '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
        '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
        '0x8207c1ffc5b6804f6024322ccf34f29c3541ae26',
        '0x3506424f91fd33084466f402d5d97f05f8e3b4af',
        '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b',
        '0xd13c7342e1ef687c5ad21b27c2b65d772cab5c8c',
        '0x18aaa7115705e8be94bffebde57af9bfc265b998',
        '0xe53EC727dbDEB9E2d5456c3be40cFF031AB40A55',
        '0xbbc2ae13b23d715c30720f079fcd9b4a74093505',
        '0xfca59cd816ab1ead66534d82bc21e7515ce441cf',
        '0x87d73e916d7057945c9bcd8cdd94e42a6f47f776',
        '0x3883f5e181fccaF8410FA61e12b59BAd963fb645'
      ]
    }
  }

  const stakingContracts = {
    ethereum: '0x9733f49D577dA2b6705cA173382C0e3CdFff2A48',
    bsc: '0xe9428B8acaA6b9d7C3314D093975c291Ec59A009',
  }

/*==================================================
  TVL
  ==================================================*/

  async function getFundBalances(block) {
    let calls = [];
    let balances = {};
    let fundsAddresses = [];

    // Prepare funds balances
    _.each(funds, (fund) => {
      let fundTokens = fund.tokens
      let fundAddress = fund.address

      // Save the funds addresses
      fundsAddresses.push(fundAddress)

      // Calculate ERC20 balance for every token of the fund
      _.each(fundTokens, (tokenAddress) => {
        calls.push({
          target: tokenAddress,
          params: fundAddress
        })
      })
    })

    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls,
      abi: 'erc20:balanceOf'
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults);

    // Fetch ETH balance of the funds
    let ETHBalances = (await sdk.api.eth.getBalances({targets: fundsAddresses, block})).output;
    balances[zeroAddress] = ETHBalances.reduce((accumulator, ETHBalance) => accumulator.plus(new BigNumber(ETHBalance.balance)), new BigNumber("0")).toFixed();

    return balances;
  }

  async function getStakedTokens(block) {
    const balances = {};

    const bscBalance = (
        await sdk.api.abi.call({
        block,
        chain: 'bsc',
        target: peakAddress,
        params: [stakingContracts.bsc],
        abi: 'erc20:balanceOf'
      })
    ).output;

    sdk.util.sumSingleBalance(balances, peakAddress, bscBalance);

    const ethBalance = (
      await sdk.api.abi.call({
        block,
        chain: 'ethereum',
        target: peakAddress,
        params: [stakingContracts.ethereum],
        abi: 'erc20:balanceOf'
      })
    ).output;

    sdk.util.sumSingleBalance(balances, peakAddress, ethBalance);

    return balances;
  }

  async function tvl(timestamp, block) {
    const balances = await getFundBalances(block);
    return balances;
  }

  async function staking(timestamp, block) {
    const balances = await getStakedTokens(block);
    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    misrepresentedTokens: true,
    name: 'PEAKDEFI',         // Peakdefi
    token: 'PEAK',            // PEAK token
    category: 'assets',       // Allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1607405152,        // Dec-08-2020 05:25:52 PM +UTC
    staking: {
      tvl: staking
    },
    tvl,                      // Tvl adapter
  }