  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require('bignumber.js');
  const abi = require('./abi.json');
  const BASE = BigNumber(10 ** 18)
  const Double = BASE * BASE;
  const mappingTokens = require("./tokenMapping.json");
  const {toUSDTBalances, usdtAddress} = require('../helper/balances')


/*==================================================
  Ethereum Settings
  ==================================================*/
  const DAI  = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const PAX  = '0x8E870D67F660D95d5be530380D0eC0bd388289E1';
  const TUSD = '0x0000000000085d4780B73119b644AE5ecd22b376';
  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const USDx = '0xeb269732ab75A6fD61Ea60b06fE994cD32a83549';

/*==================================================
  USDx
  ==================================================*/
const usdxReservedTokens = [PAX, TUSD, USDC];
const dUSDC = '0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179';

const usdxPool = '0x7FdcDAd3b4a67e00D9fD5F22f4FD89a5fa4f57bA' // USDx Stablecoin Pool


/*==================================================
  GOLDx Protocol
  ==================================================*/
  goldxReserve  = '0x45804880De22913dAFE09f4980848ECE6EcbAf78'  // PAXG
  goldxProtocol = '0x355C665e101B9DA58704A8fDDb5FeeF210eF20c0'  // GOLDx

/*==================================================
  BSC Settings
  ==================================================*/
  const BSC_BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
  const BSC_DAI  = '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3';
  const BSC_USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
  const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955';


let oracles = {
  "ethereum": "0x34BAf46eA5081e3E49c29fccd8671ccc51e61E79",
  "bsc": "0x7DC17576200590C4d0D8d46843c41f324da2046C",
  "arbitrum": "0xc3FeD5f21EB8218394f968c86CDafc66e30e259A",
  "optimism": "0x4f9312A21F8853384E0f6141F3F9fB855d860161",
}

let allControllers = {
  "ethereum": [
    "0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113", // dForce general pool
    "0x3bA6e5e5dF88b9A88B2c19449778A4754170EA17", // dForce stock pool
    "0x8f1f15DCf4c70873fAF1707973f6029DEc4164b3", // liqee general pool
  ],
  "bsc": [
    "0x0b53E608bD058Bb54748C35148484fD627E6dc0A", // dForce general pool
    "0xb6f29c4507A53A7Ab78d99C1698999dbCf33c800", // dForce stock pool
    "0x6d290f45A280A688Ff58d095de480364069af110"  // liqee general pool
  ],
  "arbitrum": ["0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408"],
  "optimism": ["0xA300A84D8970718Dac32f54F61Bd568142d8BCF4"],
}

let yieldMarkets = {
  "ethereum": [
    '0x02285AcaafEB533e03A7306C55EC031297df9224', // dDAI
    '0x109917F7C3b6174096f9E1744e41ac073b3E1F72', // dUSDx
    '0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179', // dUSDC
    '0x868277d475E0e475E38EC5CdA2d9C83B5E1D9fc8', // dUSDT
  ],
  "bsc": [
    '0xce14792a280b20c4f8E1ae76805a6dfBe95729f5', // dBUSD
    '0x4E0B5BaFC52D09A8F18eA0b7a6A7dc23A1096f99', // dDAI
    '0x6c0F322442D10269Dd557C6e3A56dCC3a1198524', // dUSDC
    '0x6199cC917C12E4735B4e9cEfbe29E9F0F75Af9E5', // dUSDT
  ],
}

let yieldUnderlyingTokens = {
  "ethereum": {
    '0x02285AcaafEB533e03A7306C55EC031297df9224': DAI,
    '0x109917F7C3b6174096f9E1744e41ac073b3E1F72': USDx,
    '0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179': USDC,
    '0x868277d475E0e475E38EC5CdA2d9C83B5E1D9fc8': USDT,
  },
  "bsc": {
    '0xce14792a280b20c4f8E1ae76805a6dfBe95729f5': BSC_BUSD,
    '0x4E0B5BaFC52D09A8F18eA0b7a6A7dc23A1096f99': BSC_DAI,
    '0x6c0F322442D10269Dd557C6e3A56dCC3a1198524': BSC_USDC,
    '0x6199cC917C12E4735B4e9cEfbe29E9F0F75Af9E5': BSC_USDT,
  }
}

/*==================================================
  TVL
  ==================================================*/

async function getTVLByTotalSupply(chain, token, block) {
  let balances = {}
  let tvl = BigNumber("0");

  let { output: assetTotalSupply } = await sdk.api.abi.call({
    block,
    target: token,
    abi: 'erc20:totalSupply',
    chain: chain
  });

  let assetPrice = await getUnderlyingPrice(chain, token, block);
  tvl = tvl.plus(BigNumber(assetTotalSupply).times(BigNumber(assetPrice)).div(Double));
  let convertedBalance = BigNumber(assetTotalSupply);

  return {
    convertedBalance,
    tvl
  }
}

async function getTVLByBalanceOf(chain, token, pool, block) {
  let balances = {}
  let tvl = BigNumber("0");

  let { output: assetBalance } = await sdk.api.abi.call({
    block,
    target: pool,
    params: token,
    abi: 'erc20:balanceOf',
    chain: chain
  });

  let assetPrice = await getUnderlyingPrice(chain, pool, block);
  tvl = tvl.plus(BigNumber(assetBalance).times(BigNumber(assetPrice)).div(Double));
  let convertedBalance = BigNumber(assetBalance);

  return {
    convertedBalance,
    tvl
  }
}

async function getCurrentCash(chain, token, block) {
  let cash;
  const { output: isiToken } = await sdk.api.abi.call({
    block,
    target: token,
    abi: abi['isiToken'],
    chain: chain
  });

  if (isiToken) {
    const { output: iTokenTotalSupply } = await sdk.api.abi.call({
      block,
      target: token,
      abi: abi['totalSupply'],
      chain: chain
    });

    const { output: iTokenExchangeRate } = await sdk.api.abi.call({
      block,
      target: token,
      abi: abi['exchangeRateCurrent'],
      chain: chain
    });

    cash = BigNumber(iTokenTotalSupply).times(BigNumber(iTokenExchangeRate)).div(BigNumber(10 ** 18));
  } else {
    if (
      // Exclude iMUSX of Liqee on BSC
      token != "0xee0D3450b577743Eee2793C0Ec6d59361eB9a454"
      // Exclude iMUSX of Liqee on Ethereum mainnet
      && token != "0x4c3F88A792325aD51d8c446e1815DA10dA3D184c"
    ) {
      let { output: underlying } = await sdk.api.abi.call({
        block,
        target: token,
        abi: abi['underlying'],
        chain: chain
      });

      // Maybe need to accrue borrowed interests
      let { output: iMtokenSupply } = await sdk.api.abi.call({
        block,
        target: underlying,
        abi: 'erc20:totalSupply',
        chain: chain
      });
      cash = BigNumber(iMtokenSupply);
    } else {
      cash = BigNumber("0");
    }
  }
  return cash;
}

async function getAllMarketsByChain(chain, block) {
  const markets = await Promise.all(
    allControllers[chain].map(async controller => {return (await
      sdk.api.abi.call({
        block,
        target: controller,
        abi: abi['getAlliTokens'],
        chain: chain
      })).output;
    }));

  return markets.flat();
}

async function getUnderlyingPrice(chain, token, block) {
  const { output: iTokenPrices }  = await sdk.api.abi.call({
    block,
    target: oracles[chain],
    params: mappingTokens[token]?mappingTokens[token]:token,
    abi: abi['getUnderlyingPrice'],
    chain: chain
  });

  return iTokenPrices;
}

async function getLendingTVLByChain(chain, block) {
  let iTokens = {};
  let lendingTVL = BigNumber("0");
  let markets = await getAllMarketsByChain(chain, block);

  await Promise.all(
    markets.map(async market => {
      let cash = await getCurrentCash(chain, market, block);
      let price = await getUnderlyingPrice(chain, market, block);

      iTokens[market] = cash;
      lendingTVL = lendingTVL.plus(cash.times(price).div(Double));
    })
  );

  return {iTokens, lendingTVL};
}

async function getTVLOfdToken(chain, block) {
  let dTokenBalances = {};
  let dTokenTVL = BigNumber("0");
  let dTokens = yieldMarkets[chain];
  let dTokenUnderlyings = yieldUnderlyingTokens[chain];
  await (
    Promise.all(dTokens.map(async (dToken) => {
      let { output: marketTVL } = await sdk.api.abi.call({
        block,
        target: dToken,
        abi: abi['getBaseData'],
        chain: chain
      });

      const _balance = marketTVL['4'] || 0;

      dTokenBalances[dTokenUnderlyings[dToken]] = BigNumber(_balance);

      let assetPrice = await getUnderlyingPrice(chain, dTokenUnderlyings[dToken], block);

      dTokenTVL = dTokenTVL.plus(BigNumber(_balance).times(BigNumber(assetPrice)).div(Double));
    }))
  );

  return {
    dTokenBalances,
    dTokenTVL
  };
}

async function getTVLByChain(chain, block) {
  let balances = {};
  let tvl = BigNumber("0");
  if (chain == "ethereum") {
    // 1. get balance and tvl of the USDx token.
    await Promise.all(
      usdxReservedTokens.map(async reserveToken => {
        let {
          convertedBalance: reserveBalance,
          tvl: reserveTVL
        } = await getTVLByBalanceOf(chain, usdxPool, reserveToken, block);

        balances[reserveToken] = reserveBalance;
        tvl = tvl.plus(reserveTVL);
      })
    );
    // 2. get balance and tvl of the GOLDx token.
    let {
      convertedBalance: goldxTotalSupply,
      tvl: goldxTVL
    } = await getTVLByTotalSupply(chain, goldxProtocol, block);
    balances[goldxProtocol] = BigNumber(balances[goldxProtocol] || 0).plus(goldxTotalSupply);
    tvl = tvl.plus(goldxTVL);
    // 3. get balance and tvl of the dToken protocol.
    let {
      dTokenBalances: dTokenDetails,
      dTokenTVL: dTokenTVL
    } = await getTVLOfdToken(chain, block);
    tvl = tvl.plus(dTokenTVL);

  } else if (chain == "bsc") {
    // 3. get balance and tvl of the dToken protocol.
    let {
      dTokenBalances: dTokenDetails,
      dTokenTVL: dTokenTVL
    } = await getTVLOfdToken(chain, block);
    tvl = tvl.plus(dTokenTVL);
  }
  // 4. get balance and tvl of the lending protocol.
  let {
    iTokens: iTokensDetials,
    lendingTVL: lendingTVL
  } = await getLendingTVLByChain(chain, block);

  tvl = tvl.plus(lendingTVL);

  return toUSDTBalances(tvl.toNumber());
}

async function ethereum(timestamp, ethBlock, chainBlocks) {
  return getTVLByChain('ethereum', ethBlock);
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  return getTVLByChain('bsc', chainBlocks['bsc']);
}

async function arbitrum(timestamp, ethBlock, chainBlocks) {
  return getTVLByChain('arbitrum', chainBlocks['arbitrum']);
}

async function optimism(timestamp, ethBlock, chainBlocks) {
  return getTVLByChain('optimism', chainBlocks['optimism']);
}

module.exports = {
  ethereum:{
    tvl: ethereum
  },
  bsc: {
    tvl: bsc
  },
  arbitrum:{
    tvl: arbitrum
  },
  optimism: {
    tvl: optimism
  },
  start: 1564165044, // Jul-27-2019 02:17:24 AM +UTC
  tvl: sdk.util.sumChainTvls([ethereum, bsc, arbitrum, optimism])
}
