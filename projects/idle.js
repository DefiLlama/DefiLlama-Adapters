const axios = require("axios");
const retry = require('./helper/retry');
const web3 = require('./config/web3.js');
const BigNumber = require('bignumber.js');
const COMP_abi = require('./config/idle/COMP.js').abi;
const IdleCDO = require('./config/idle/IdleCDO.js').abi;
const ERC20_abi = require('./config/idle/ERC20.js').abi;
const IdleTokenV4 = require('./config/idle/IdleTokenV4.js').abi;
const IdleTokenV3 = require('./config/idle/IdleTokenV3.js').abi;
const uniswapRouter = require('./config/idle/uniswapRouter.js').abi;
const UniswapExchangeInterface = require('./config/idle/UniswapExchangeInterface.js').abi;

async function fetch() {

  //Tranches info
  const trancheContracts = {
    DAI: {
      abi: IdleCDO,
      decimals: 18,
      name: 'IdleCDO_idleDAIYield',
      address: '0xd0DbcD556cA22d3f3c142e9a3220053FD7a247BC'
    },
    FEI: {
      abi: IdleCDO,
      decimals: 18,
      name: 'IdleCDO_idleFEIYield',
      address: '0x77648a2661687ef3b05214d824503f6717311596'
    }
  };

  // Idle tokens info
  const contracts = {
    idleWETHYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'WETH',
      address: '0xC8E6CA6E96a326dC448307A5fDE90a0b21fd7f80',
    },
    idleRAIYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'RAI',
      address: '0x5C960a3DCC01BE8a0f49c02A8ceBCAcf5D07fABe',
    },
    idleFEIYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'FEI',
      address: '0xb2d5CB72A621493fe83C6885E4A776279be595bC',
    },
    idleDAIYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'DAI',
      address: '0x3fe7940616e5bc47b0775a0dccf6237893353bb4'
    },
    idleDAIYieldV3: {
      abi: IdleTokenV3,
      underlyingToken: 'DAI',
      address: '0x78751b12da02728f467a44eac40f5cbc16bd7934'
    },
    idleUSDCYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'USDC',
      address: '0x5274891bEC421B39D23760c04A6755eCB444797C'
    },
    idleUSDCYieldV3: {
      abi: IdleTokenV3,
      underlyingToken: 'USDC',
      address: '0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6'
    },
    idleUSDTYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'USDT',
      address: '0xF34842d05A1c888Ca02769A633DF37177415C2f8'
    },
    idleUSDTYieldV3: {
      abi: IdleTokenV3,
      underlyingToken: 'USDT',
      address: '0x63D27B3DA94A9E871222CB0A32232674B02D2f2D'
    },
    idleSUSDYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'SUSD',
      address: '0xf52cdcd458bf455aed77751743180ec4a595fd3f'
    },
    idleSUSDYieldV3: {
      abi: IdleTokenV3,
      underlyingToken: 'SUSD',
      address: '0xe79e177d2a5c7085027d7c64c8f271c81430fc9b'
    },
    idleTUSDYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'TUSD',
      address: '0xc278041fDD8249FE4c1Aad1193876857EEa3D68c'
    },
    idleTUSDYieldV3: {
      abi: IdleTokenV3,
      underlyingToken: 'TUSD',
      address: '0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1'
    },
    idleWBTCYieldV4: {
      abi: IdleTokenV4,
      underlyingToken: 'WBTC',
      address: '0x8C81121B15197fA0eEaEE1DC75533419DcfD3151'
    },
    idleWBTCYieldV3: {
      abi: IdleTokenV3,
      underlyingToken: 'WBTC',
      address: '0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55'
    },
    idleDAISafeV4: {
      abi: IdleTokenV4,
      underlyingToken: 'DAI',
      address: '0xa14ea0e11121e6e951e87c66afe460a00bcd6a16'
    },
    idleDAISafeV3: {
      abi: IdleTokenV3,
      underlyingToken: 'DAI',
      address: '0x1846bdfDB6A0f5c473dEc610144513bd071999fB'
    },
    idleUSDCSafeV4: {
      abi: IdleTokenV4,
      underlyingToken: 'USDC',
      address: '0x3391bc034f2935ef0e1e41619445f998b2680d35'
    },
    idleUSDCSafeV3: {
      abi: IdleTokenV3,
      underlyingToken: 'USDC',
      address: '0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C'
    },
    idleUSDTSafeV4: {
      abi: IdleTokenV4,
      underlyingToken: 'USDT',
      address: '0x28fAc5334C9f7262b3A3Fe707e250E01053e07b5'
    },
    idleUSDTSafeV3: {
      abi: IdleTokenV3,
      underlyingToken: 'USDT',
      address: '0x42740698959761baf1b06baa51efbd88cb1d862b'
    }
  };

  // Underlying tokens contracts
  const underlyingTokensContracts = {
    DAI: new web3.eth.Contract(ERC20_abi, '0x6b175474e89094c44da98b954eedeac495271d0f'),
    USDC: new web3.eth.Contract(ERC20_abi, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
    USDT: new web3.eth.Contract(ERC20_abi, '0xdac17f958d2ee523a2206206994597c13d831ec7'),
    SUSD: new web3.eth.Contract(ERC20_abi, '0x57ab1ec28d129707052df4df418d58a2d46d5f51'),
    TUSD: new web3.eth.Contract(ERC20_abi, '0x0000000000085d4780b73119b644ae5ecd22b376'),
    WBTC: new web3.eth.Contract(ERC20_abi, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
    WETH: new web3.eth.Contract(ERC20_abi, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
    RAI: new web3.eth.Contract(ERC20_abi, '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919'),
    FEI: new web3.eth.Contract(ERC20_abi, '0x956f47f50a910163d8bf957cf5846d573e7f87ca')
  };

  // Initialize COMP
  const COMPAddr = '0xc00e94cb662c3520282e6f5717214004a7f26888';
  const compContract = new web3.eth.Contract(COMP_abi, COMPAddr);

  // Initialize Uniswap Router
  const uniswapRouterAddr = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const UniswapRouter = new web3.eth.Contract(uniswapRouter, uniswapRouterAddr);

  // Initialize Uniswap V1
  const UNI_V1_WBTC_ETH = '0x4d2f5cFbA55AE412221182D8475bC85799A5644b';
  const UNI_V1_DAI_ETH = '0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667';

  const uniswapWBTC = new web3.eth.Contract(UniswapExchangeInterface, UNI_V1_WBTC_ETH);
  const uniswapDAI = new web3.eth.Contract(UniswapExchangeInterface, UNI_V1_DAI_ETH);

  const BNify = n => new BigNumber(n);

  const getWBTCConversionRate = async () => {
    const oneToken = BNify('1e08').times(BNify(0.0001));
    const ethSwapped = await uniswapWBTC.methods.getTokenToEthInputPrice(oneToken.toFixed()).call();
    const daiSwapped = await uniswapDAI.methods.getEthToTokenInputPrice(ethSwapped).call();
    return BNify(daiSwapped).times(BNify('10000')).div(1e18);
  }
  const getWETHConversionRate = async () => {
    const one = BNify('1000000000000000000');
    const DAIAddr = '0x6b175474e89094c44da98b954eedeac495271d0f';

    const path = [DAIAddr, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'];
    const unires = await UniswapRouter.methods.getAmountsIn(one.toFixed(), path).call();
    if (unires) {

      return BNify(unires[0]).div(one);
    }
    return null;
  }

  const getUniswapConversionRate = async (tokenAddr) => {
    const one = BNify('1000000000000000000');
    const DAIAddr = '0x6b175474e89094c44da98b954eedeac495271d0f';
    const path = [DAIAddr, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', tokenAddr];
    const unires = await UniswapRouter.methods.getAmountsIn(one.toFixed(), path).call();
    if (unires) {
      return BNify(unires[0]).div(one);
    }
    return null;
  }

  // Calculate TVL
  const calls = [];

  Object.keys(contracts).forEach((contractName) => {

    const call = new Promise(async (resolve, reject) => {
      const contractInfo = contracts[contractName];
      const idleContract = new web3.eth.Contract(contractInfo.abi, contractInfo.address);
      const underlyingTokenContract = underlyingTokensContracts[contractInfo.underlyingToken];

      let [
        tokenPrice,
        totalSupply,
        tokenDecimals,
        compBalance,
        underlyingTokenBalance
      ] = await Promise.all([
        idleContract.methods.tokenPrice().call(),
        idleContract.methods.totalSupply().call(),
        underlyingTokenContract.methods.decimals().call(),
        compContract.methods.balanceOf(contractInfo.address).call(),
        underlyingTokenContract.methods.balanceOf(contractInfo.address).call()
      ]);

      let tokenTVL = BNify(totalSupply).div(1e18).times(BNify(tokenPrice).div(`1e${tokenDecimals}`));

      // Get unlent funds
      if (tokenDecimals && underlyingTokenBalance) {
        underlyingTokenBalance = BNify(underlyingTokenBalance);
        if (!underlyingTokenBalance.isNaN() && underlyingTokenBalance.gt(0)) {
          underlyingTokenBalance = underlyingTokenBalance.div(`1e${tokenDecimals}`);
          tokenTVL = tokenTVL.plus(underlyingTokenBalance);
        }
      }

      switch (contractInfo.underlyingToken){
        case 'WBTC':
          const wbtcRate = await getWBTCConversionRate();
          if (wbtcRate) {
            tokenTVL = tokenTVL.times(wbtcRate);
          }
        break;
        case 'WETH':
          const wethRate = await getWETHConversionRate();
          if (wethRate) {
            tokenTVL = tokenTVL.times(wethRate);
          }
        break;
        case 'RAI':
          const raiAddr = underlyingTokenContract._address;
          const raiRate = await getUniswapConversionRate(raiAddr);
          if (raiRate) {
            tokenTVL = tokenTVL.times(raiRate);
          }
        break;
        default:
        break;
      }

      // Get COMP balance
      compBalance = BNify(compBalance);
      if (!compBalance.isNaN() && compBalance.gt(0)) {
        const compRate = await getUniswapConversionRate(COMPAddr);
        if (compRate) {
          // Add COMP balance to TVL
          compBalance = compBalance.div(1e18).times(compRate);
          tokenTVL = tokenTVL.plus(compBalance);
        }
      }

      // console.log(contractName,tokenTVL.toString());

      resolve(tokenTVL);
    });

    calls.push(call);
  });

  Object.keys(trancheContracts).forEach((contractName) => {

    const call = new Promise(async (resolve, reject) => {
      const contractInfo = trancheContracts[contractName];
      const idleContract = new web3.eth.Contract(contractInfo.abi, contractInfo.address);

      const TVL = await idleContract.methods.getContractValue().call();
      const tokenTVL = new BigNumber(TVL).div(1e18);

      // console.log(contractInfo.name,contractInfo.address,tokenTVL.toString());

      resolve(tokenTVL);
    });

    calls.push(call);
  });

  const res = await Promise.all(calls);
  const totalTVL = res.reduce((totalTVL, tokenTVL) => {
    return totalTVL.plus(tokenTVL);
  }, BNify(0));

  // console.log('totalTVL',parseFloat(totalTVL));

  return parseFloat(totalTVL);
}

module.exports = {
  fetch
};