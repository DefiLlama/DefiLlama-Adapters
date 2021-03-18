/*==================================================
  Modules
  ==================================================*/
const sdk = require('../../sdk');
const BigNumber = require("bignumber.js");

/*==================================================
  Settings
  ==================================================*/
const GLOBAL_CONFIG_ADDRESS = "0xa13B12D2c2EC945bCAB381fb596481735E24D585";
const SAVINGS_ADDRESS = '0x7a9E457991352F8feFB90AB1ce7488DF7cDa6ed5';
const abi = require('./abi.json');
const tokensInfo = {
  '0x000000000000000000000000000000000000000E': { symbol: "ETH" },
  '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': { symbol: "MKR" },
}

/*==================================================
  utility
  ==================================================*/
const utility = {
  // get the latest TokenRegistry address through the GlobalConfig contract
  async getTokenRegistryAddressByGlobalConfig(block) {
    return (await sdk.api.abi.call({
      block,
      target: GLOBAL_CONFIG_ADDRESS,
      params: [],
      abi: abi['global:tokenInfoRegistry'],
    })).output;
  },

  // Get the latest Bank address through the GlobalConfig contract
  async getBankAddressByGlobalConfig(block) {
    return (await sdk.api.abi.call({
      block,
      target: GLOBAL_CONFIG_ADDRESS,
      params: [],
      abi: abi['global:bank'],
    })).output;

  },

  // Get the TokenRegistry contract
  async getTokenRegistryContract(block, ads) {
    return (await sdk.api.abi.call({
      block,
      target: ads,
      params: [],
      abi: abi['tokenRegistry:getTokens'],
    })).output;

  },

  // Get all tokens
  async getMarkets(block) {
    // Get TokenRegistry Address
    let tokenRegistryAddress = await utility.getTokenRegistryAddressByGlobalConfig(block);

    // Get latest markets
    let currentMarkets = await utility.getTokenRegistryContract(block, tokenRegistryAddress);
    return currentMarkets;
  },

  async getBankPoolAmounts(block, markets) {
    let bankAddress = await utility.getBankAddressByGlobalConfig(block);
    let callsArray = [];
    markets.forEach(element => {
      callsArray.push({
        target: bankAddress,
        params: element
      })
    });
    return (await sdk.api.abi.multiCall({
      block,
      abi: abi['bank:getPoolAmount'],
      calls: callsArray
    })).output;
  },

  async getBankContractTokenState(block, markets) {
    let bankAddress = await utility.getBankAddressByGlobalConfig(block);
    let callsArray = [];
    markets.forEach(element => {
      callsArray.push({
        target: bankAddress,
        params: element
      })
    });
    return (await sdk.api.abi.multiCall({
      block,
      abi: abi['bank:getTokenState'],
      calls: callsArray
    })).output;
  },

  // Get Token Value
  async getCtokenValue(block, ctoken) {
    let cEthToken = await sdk.api.abi.call({
      target: ctoken,
      params: SAVINGS_ADDRESS,
      abi: 'erc20:balanceOf',
      block
    });
    return cEthToken.output;
  },

  // Get Symbol
  async getSymbol(block, markets) {
    let callsArray = [];

    markets.forEach(element => {
      callsArray.push({
        target: element
      })
    });
    return (await sdk.api.abi.multiCall({
      block,
      abi: 'erc20:symbol',
      calls: callsArray
    })).output;
  },

  // Get cTokens
  async getCTokens(block, markets) {
    let tokenRegistryAddress = await utility.getTokenRegistryAddressByGlobalConfig(block);
    let callsArray = [];
    let allTokenObj = {};
    markets.forEach(token_address => {
      allTokenObj[token_address] = "";
      callsArray.push({
        target: tokenRegistryAddress,
        params: token_address
      });
    });
    let cToken = (await sdk.api.abi.multiCall({
      block,
      abi: abi['tokenRegistry:getCToken'],
      calls: callsArray
    })).output;

    let zeroCTokenAddress = '0x0000000000000000000000000000000000000000';
    cToken.forEach(item => {
      if (item.success) {
        allTokenObj[item.input.params[0]] = item.output === zeroCTokenAddress ? "" : item.output
      }
    });
    return allTokenObj;
  },
  // 
  async handlerTokenApr(block, markets) {
    // Year Total Blocks Number
    let yearTotalBlocksNumber = 365 * 24 * 60 * 4;

    let targetTokenObj = {};

    let allTokenObj = await utility.getCTokens(block, markets)

    let ctokenMapToken = {};
    let callsCompArray = [];
    let capitalCompoundRatioArray = [];

    // Get capitalUtilizationRatio
    let bankAddress = await utility.getBankAddressByGlobalConfig(block);
    let callsArray = [];
    markets.forEach(token_address => {
      callsArray.push({
        target: bankAddress,
        params: token_address
      })
    });
    let capitalUtilizationRatio = (await sdk.api.abi.multiCall({
      block,
      abi: abi['bank:getCapitalUtilizationRatio'],
      calls: callsArray
    })).output;

    let tempValue = BigNumber(3).times(Math.pow(10, 16)).toFixed(0);
    capitalUtilizationRatio.forEach(item => {
      if (allTokenObj[item.input.params[0]]) {
        callsCompArray.push({
          target: allTokenObj[item.input.params[0]]
        })
        capitalCompoundRatioArray.push({
          target: bankAddress,
          params: item.input.params[0]

        })
        ctokenMapToken[allTokenObj[item.input.params[0]]] = item.input.params[0];
      }

      if (item.success) {
        // ((capitalUtilizationRatio * 15*10**16)/10**18)+3*10**16;
        let notSupportCompBorrowRatePerBlock = (
          BigNumber(item.output)
            .times(15 * Math.pow(10, 16))
            .div(Math.pow(10, 18))
            .plus(tempValue)
            .div(yearTotalBlocksNumber)
        ).toFixed(0);

        targetTokenObj[item.input.params[0]] = {
          ctoken: allTokenObj[item.input.params[0]] || '',
          capitalUtilizationRatio: item.output,
          notSupportCompBorrowRatePerBlock: notSupportCompBorrowRatePerBlock,
          supplyRatePerBlockComp: "",
          borrowRatePerBlockComp: "",
          capitalCompoundRatio: "",
          deposit_apr: "",
          borrow_apr: "",
        };
      }
    });

    let supplyRatePerBlock = (await sdk.api.abi.multiCall({
      block,
      abi: abi['ctoken:supplyRatePerBlock'],
      calls: callsCompArray
    })).output;

    let borrowRatePerBlock = (await sdk.api.abi.multiCall({
      block,
      abi: abi['ctoken:borrowRatePerBlock'],
      calls: callsCompArray
    })).output;

    // capitalCompoundRatioArray
    let getCapitalCompoundRatio = (await sdk.api.abi.multiCall({
      block,
      abi: abi['bank:getCapitalCompoundRatio'],
      calls: capitalCompoundRatioArray
    })).output;

    supplyRatePerBlock.forEach(item => {
      if (item.success) {
        targetTokenObj[ctokenMapToken[item.input.target]].supplyRatePerBlockComp = item.output
      }
    });
    borrowRatePerBlock.forEach(item => {
      if (item.success) {
        targetTokenObj[ctokenMapToken[item.input.target]].borrowRatePerBlockComp = item.output
      }
    });
    getCapitalCompoundRatio.forEach(item => {
      if (item.success) {
        targetTokenObj[item.input.params[0]].capitalCompoundRatio = item.output
      }
    });

    // handle borrowRatePerBlock / depositRatePerBlock
    Object.keys(targetTokenObj).forEach(token_address => {
      let item = targetTokenObj[token_address];
      let borrowRatePerBlock;
      let depositRatePerBlock;
      if (item.ctoken) {
        let supplyRatePerBlockCompValue = BigNumber(item.supplyRatePerBlockComp).times(0.4).toFixed(0);
        let borrowRatePerBlockCompValue = BigNumber(item.borrowRatePerBlockComp).times(0.6).toFixed(0);
        // supply*0.4+borrow*0.6
        borrowRatePerBlock = BigNumber(supplyRatePerBlockCompValue).plus(borrowRatePerBlockCompValue).toFixed(0);

        // ((borrowRatePerBlock * capitalUtilizationRatio ) + ( supplyRatePerBlockComp * capitalCompoundRatio ))/10**18
        depositRatePerBlock = BigNumber(borrowRatePerBlock)
          .times(item.capitalUtilizationRatio)
          .plus(
            BigNumber(item.supplyRatePerBlockComp)
              .times(item.capitalCompoundRatio))
          .div(Math.pow(10, 18))
          .toFixed(0);

        // if deposit depositRatePerBlock is zero;
        // depositRatePerBlock = supplyRatePerBlockComp * 0.85
        if (depositRatePerBlock === "0") {
          depositRatePerBlock = BigNumber(item.supplyRatePerBlockComp || 0).times(0.85).toFixed(0);
        }
      } else {
        // Does not support CToken
        borrowRatePerBlock = item.notSupportCompBorrowRatePerBlock;

        // notSupportCompBorrowRatePerBlock * capitalUtilizationRatio / 10**18
        depositRatePerBlock = BigNumber(item.notSupportCompBorrowRatePerBlock).times(item.capitalUtilizationRatio).div(Math.pow(10, 18)).toFixed(0);
      }
      let depositApr = ((Math.pow(1 + (depositRatePerBlock / Math.pow(10, 18)), yearTotalBlocksNumber) - 1) * 100).toFixed(18);
      let borrowApr = ((Math.pow(1 + (borrowRatePerBlock / Math.pow(10, 18)), yearTotalBlocksNumber) - 1) * 100).toFixed(18);
      item.deposit_apr = depositApr
      item.borrow_apr = borrowApr
    })
    return targetTokenObj;
  },
  formatRates(tokensObj) {
    let result = {
      lend: {},
      borrow: {},
      supply: {}
    }
    Object.keys(tokensObj).forEach(tokenAddress => {
      let tokenItem = tokensObj[tokenAddress];
      result.lend[tokenItem.symbol] = tokenItem.lend;
      result.borrow[tokenItem.symbol] = tokenItem.borrow;
      result.supply[tokenItem.symbol] = tokenItem.supply;
    })
    return result;
  }
}

/*==================================================
  TVL
  ==================================================*/
async function tvl(timestamp, block) {
  let balances = {
    '0x000000000000000000000000000000000000000E': "0",// ETH
    '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5': '0',// cETH
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': "0",// DAI
    '0x0000000000085d4780B73119b644AE5ecd22b376': "0",
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': "0",
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': "0",
    '0xE41d2489571d322189246DaFA5ebDe1F4699F498': "0",
    '0x1985365e9f78359a9B6AD760e32412f4a445E862': "0",
    '0x0D8775F648430679A709E98d2b0Cb6250d2887EF': "0",
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': "0",
    '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': "0",
    '0x514910771AF9Ca656af840dff83E8264EcF986CA': "0"
  };
  if (block > 10819469) {
    // Get all Tokens in the market
    let markets = await utility.getMarkets(block);

    // Get Bank
    let banksPoolAmounts = await utility.getBankPoolAmounts(block, markets);

    banksPoolAmounts.forEach(result => {
      if (result.success === true) {
        balances[result.input.params] = result.output;
      }
    });

    // cETH value
    balances['0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'] = await utility.getCtokenValue(block, '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5');
  }
  return balances;
}

/*==================================================
  Rates
  ==================================================*/
async function rates(timestamp, block) {
  let initTokens = {};
  if (block > 10819469) {
    // Get all Tokens in the market
    let markets = await utility.getMarkets(block);

    // Create source data format
    let tokenSymbols = await utility.getSymbol(block, markets);
    tokenSymbols.forEach(item => {
      if (item.success === true) {
        initTokens[item.input.target] = { symbol: item.output, lend: "0", borrow: "0", supply: "0", }
      } else {
        initTokens[item.input.target] = { symbol: tokensInfo[item.input.target].symbol || 'Unknown', lend: "0", borrow: "0", supply: "0", }
      }
    })

    // handle token supply
    let banksContractTokenState = await utility.getBankContractTokenState(block, markets);
    banksContractTokenState.forEach(item => {
      if (item.success === true) {
        initTokens[item.input.params[0]].supply = item.output.loans;
      }
    });

    // handle token APR
    let tokenAprInfoObj = await utility.handlerTokenApr(block, markets);
    Object.keys(tokenAprInfoObj).forEach(token_address => {
      initTokens[token_address].lend = tokenAprInfoObj[token_address].deposit_apr;
      initTokens[token_address].borrow = tokenAprInfoObj[token_address].borrow_apr;
    })

  }

  // Create output format
  let result = utility.formatRates(initTokens);
  return result;
}

/*==================================================
  Exports
  ==================================================*/
module.exports = {
  name: 'DeFiner',
  website: 'https://definer.org/',
  token: "FIN",
  category: 'lending',
  start: 10819493, // 09-08-2020 06:55:19 AM +UTC
  tvl,
  rates,
  term: '1 block',
  permissioning: 'Open',
  variability: 'Medium',
};
