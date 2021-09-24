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
  const BUSD = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
  const DAI  = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const DF   = '0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0';
  const ETH  = "0x0000000000000000000000000000000000000000";
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
  const USX =  '0x0a5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8';
  const EUX =  '0xb986F3a2d91d3704Dc974A24FB735dCc5E3C1E70';
  const xBTC = '0x527Ec46Ac094B399265d1D71Eff7b31700aA655D';
  const xETH = '0x8d2Cb35893C01fa8B564c84Bd540c5109d9D278e';
  const xTSLA = '0x8dc6987F7D8E5aE9c39F767A324C5e46C1f731eB';
  const xAAPL = '0xc4Ba45BeE9004408403b558a26099134282F2185';
  const xAMZN = '0x966E726853Ca97449F458A3B012318a08B508202';
  const xCOIN = '0x32F9063bC2A2A57bCBe26ef662Dc867d5e6446d1';
  const LINK = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  const MKR = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';

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
    '0x1AdC34Af68e970a93062b67344269fD341979eb0', // iUSX
    '0x44c324970e5CbC5D4C3F3B7604CbC6640C2dcFbF', // iEUX
    '0x4013e6754634ca99aF31b5717Fa803714fA07B35', // ixBTC
    '0x237C69E082A94d37EBdc92a84b58455872e425d6', // ixETH
    '0x039E7Ef6a674f3EC1D88829B8215ED45385c24bc', // iMKR
    '0x6E6a689a5964083dFf9FD7A0f788BAF620ea2DBe', // iTUSD
    '0xA3068AA78611eD29d381E640bb2c02abcf3ca7DE', // iLINK
  ]

/*==================================================
  BSC Settings
  ==================================================*/
  const BSC_ADA  = '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47';
  const BSC_ATOM = '0x0Eb3a705fc54725037CC9e008bDede697f62F335';
  const BSC_BTCB = '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c';
  const BSC_BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
  const BSC_DAI  = '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3';
  const BSC_DF   = '0x4A9A2b2b04549C3927dd2c9668A5eF3fCA473623';
  const BSC_DOT  = '0x7083609fce4d1d8dc0c979aab8c869ea2c873402';
  const BSC_ETH  = '0x2170ed0880ac9a755fd29b2688956bd959f933f8';
  const BSC_FIL  = '0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153';
  const BSC_GOLDx= '0xA05478B34Fad86cC86F07EB6698c69EA60B266E3';
  const BSC_UNI  = '0xbf5140a22578168fd562dccf235e5d43a02ce9b1';
  const BSC_USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
  const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955';
  const BSC_USX = '0xB5102CeE1528Ce2C760893034A4603663495fD72';
  const BSC_EUX = '0x367c17D19fCd0f7746764455497D63c8e8b2BbA3';
  const BSC_xBTC = '0x20Ecc92F0a33e16e8cf0417DFc3F586cf597F3a9';
  const BSC_xETH = '0x463E3D1e01D048FDf872710F7f3745B5CDF50D0E';
  const BSC_xTSLA = '0xf21259B517D307F0dF8Ff3D3F53cF1674EBeAFe8';
  const BSC_xAAPL = '0x70D1d7cDeC24b16942669A5fFEaDA8527B744502';
  const BSC_xAMZN = '0x0326dA9E3fA36F946CFDC87e59D24B45cbe4aaD0';
  const BSC_xCOIN = '0x3D9a9ED8A28A64827A684cEE3aa499da1824BF6c';
  const BSC_XRP = '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE';
  const BSC_LTC = '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94';
  const BSC_LINK = '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD';
  const BSC_CAKE = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
  const BSC_BCH = '0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf';
  const BSC_XTZ = '0x16939ef78684453bfDFb47825F8a5F714f12623a';

/*==================================================
  BSC iToken Lending Protocol
  ==================================================*/
  const bscLendingMarkets = [
    '0xFc5Bb1E8C29B100Ef8F12773f972477BCab68862', // iADA
    '0x55012aD2f0A50195aEF44f403536DF2465009Ef7', // iATOM
    '0xd57E1425837567F74A35d07669B23Bfb67aA4A93', // iBNB
    '0x5511b64Ae77452C7130670C79298DEC978204a47', // iBUSD
    '0x0b66A250Dadf3237DdB38d485082a7BfE400356e', // iBTC
    '0xAD5Ec11426970c32dA48f58c92b1039bC50e5492', // iDAI
    '0xeC3FD540A2dEE6F479bE539D64da593a59e12D08', // iDF
    '0x9ab060ba568B86848bF19577226184db6192725b', // iDOT
    '0x390bf37355e9dF6Ea2e16eEd5686886Da6F47669', // iETH
    '0xD739A569Ec254d6a20eCF029F024816bE58Fb810', // iFIL
    '0xc35ACAeEdB814F42B2214378d8950F8555B2D670', // iGOLDx
    '0xee9099C1318cf960651b3196747640EB84B8806b', // iUNI
    '0xAF9c10b341f55465E8785F0F81DBB52a9Bfe005d', // iUSDC
    '0x0BF8C72d618B5d46b055165e21d661400008fa0F', // iUSDT
    '0x7B933e1c1F44bE9Fb111d87501bAADA7C8518aBe', // iUSX
    '0x983A727Aa3491AB251780A13acb5e876D3f2B1d8', // iEUX
    '0x219B850993Ade4F44E24E6cac403a9a40F1d3d2E', // ixBTC
    '0xF649E651afE5F05ae5bA493fa34f44dFeadFE05d', // ixETH
    '0x6D64eFfe3af8697336Fc57efD5A7517Ad526Dd6d', // iXRP
    '0xd957BEa67aaDb8a72061ce94D033C631D1C1E6aC', // iLTC
    '0x50E894894809F642de1E11B4076451734c963087', // iLINK
    '0xeFae8F7AF4BaDa590d4E707D900258fc72194d73', // iCAKE
    '0x9747e26c5Ad01D3594eA49ccF00790F564193c15', // iBCH
    '0x8be8cd81737b282C909F1911f3f0AdE630c335AA', // iXTZ
  ]

  /*==================================================
  BSC Synth Markets
  ==================================================*/
  const bscAllSynthMarkets = [
    BSC_USX,
    BSC_EUX,
    BSC_xBTC,
    BSC_xETH,
    BSC_xTSLA,
    BSC_xAAPL,
    BSC_xAMZN,
    BSC_xCOIN,
  ]

/*==================================================
  Arbitrum Settings
  ==================================================*/
  const Arbitrum_WBTC = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f';
  const Arbitrum_ETH  = "0x0000000000000000000000000000000000000000";
  const Arbitrum_USDC = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8';
  const Arbitrum_USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
  const Arbitrum_UNI  = '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0';
  const Arbitrum_LINK = '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4';
  const Arbitrum_USX = '0x641441c631e2F909700d2f41FD87F0aA6A6b4EDb';
  const Arbitrum_EUX = '0xC2125882318d04D266720B598d620f28222F3ABd';

/*==================================================
  Arbitrum iToken Lending Protocol
  ==================================================*/
  const ArbitrumLendingMarkets = [
    '0xEe338313f022caee84034253174FA562495dcC15', // iETH
    '0x013ee4934ecbFA5723933c4B08EA5E47449802C8', // iLINK
    '0x46Eca1482fffb61934C4abCA62AbEB0b12FEb17A', // iUNI
    '0x8dc3312c68125a94916d62B97bb5D925f84d4aE0', // iUSDC
    '0xf52f079Af080C9FB5AFCA57DDE0f8B83d49692a9', // iUSDT
    '0xD3204E4189BEcD9cD957046A8e4A643437eE0aCC', // iWBTC
    '0x5675546Eb94c2c256e6d7c3F7DcAB59bEa3B0B8B', // iEUX
    '0x0385F851060c09A552F1A28Ea3f612660256cBAA', // iUSX
  ]

/*==================================================
  Arbitrum Synth Markets
  ==================================================*/
  const arbitrumAllSynthMarkets = [
    Arbitrum_USX,
    Arbitrum_EUX,
  ]

let oracles = {
  "ethereum": "0x34BAf46eA5081e3E49c29fccd8671ccc51e61E79",
  "bsc": "0x7DC17576200590C4d0D8d46843c41f324da2046C",
  "arbitrum": "0xc3FeD5f21EB8218394f968c86CDafc66e30e259A",
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

let allSynthMarkets = {
  "ethereum": [
    USX,
    EUX,
    xBTC,
    xETH,
    xTSLA,
    xAAPL,
    xAMZN,
    xCOIN,
  ],
  "bsc": [
    BSC_USX,
    BSC_EUX,
    BSC_xBTC,
    BSC_xETH,
    BSC_xTSLA,
    BSC_xAAPL,
    BSC_xAMZN,
    BSC_xCOIN,
  ],
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

async function getTVLOfSynthMarket(chain, block) {
  let synthMarketBalances = {};
  let SynthMarketTVL = BigNumber("0");

  let synthMarkets = allSynthMarkets[chain];

  await Promise.all(
    synthMarkets.map(async synthMarket => {
      let {
        convertedBalance: synthMarketTotalSupply,
        tvl: synthMarketTVL
      } = await getTVLByTotalSupply(chain, synthMarket, block);

      synthMarketBalances[synthMarket] = synthMarketTotalSupply;
      SynthMarketTVL = SynthMarketTVL.plus(synthMarketTVL);
    })
  );

  return {synthMarketBalances,SynthMarketTVL};
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
  start: 1564165044, // Jul-27-2019 02:17:24 AM +UTC
  tvl: sdk.util.sumChainTvls([ethereum, bsc, arbitrum])
}
