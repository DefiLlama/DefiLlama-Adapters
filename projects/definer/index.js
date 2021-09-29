/*==================================================
  Modules
  ==================================================*/
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

/*==================================================
        Settings
        ==================================================*/
const abi = require("./abi.json");
const contracts = {
  ethereum: {
    DEPLOY_BLOCK: 10819469,
    GLOBAL_CONFIG_ADDRESS: "0xa13B12D2c2EC945bCAB381fb596481735E24D585",
    SAVINGS_ADDRESS: "0x7a9E457991352F8feFB90AB1ce7488DF7cDa6ed5",
    CETH: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
  },
  okexchain: {
    DEPLOY_BLOCK: 3674844,
    GLOBAL_CONFIG_ADDRESS: "0xAdD7b91FA4DC452A9C105F218236B28F17562555",
    SAVINGS_ADDRESS: "0xF3c87c005B04a07Dc014e1245f4Cff7A77b6697b",
    CETH: "0x621CE6596E0B9CcF635316BFE7FdBC80C3029Bec",
  },
};

/*==================================================
        utility
        ==================================================*/
const utility = {
  // get the latest TokenRegistry address through the GlobalConfig contract
  async getTokenRegistryAddressByGlobalConfig(block, chain) {
    return (
      await sdk.api.abi.call({
        block: block,
        chain: chain,
        target: contracts[chain].GLOBAL_CONFIG_ADDRESS,
        params: [],
        abi: abi["global:tokenInfoRegistry"],
      })
    ).output;
  },

  // Get the latest Bank address through the GlobalConfig contract
  async getBankAddressByGlobalConfig(block, chain) {
    return (
      await sdk.api.abi.call({
        block: block,
        chain: chain,
        target: contracts[chain].GLOBAL_CONFIG_ADDRESS,
        params: [],
        abi: abi["global:bank"],
      })
    ).output;
  },

  // Get the TokenRegistry contract
  async getTokenRegistryContract(block, ads, chain) {
    return (
      await sdk.api.abi.call({
        block: block,
        chain: chain,
        target: ads,
        params: [],
        abi: abi["tokenRegistry:getTokens"],
      })
    ).output;
  },

  // Get all tokens
  async getMarkets(block, chain) {
    // Get TokenRegistry Address
    let tokenRegistryAddress =
      await utility.getTokenRegistryAddressByGlobalConfig(block, chain);

    // Get latest markets
    let currentMarkets = await utility.getTokenRegistryContract(
      block,
      tokenRegistryAddress,
      chain
    );
    return currentMarkets;
  },

  async getBankPoolAmounts(block, markets, chain) {
    let bankAddress = await utility.getBankAddressByGlobalConfig(block, chain);
    let callsArray = [];
    markets.forEach((element) => {
      callsArray.push({
        target: bankAddress,
        params: element,
      });
    });
    return (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["bank:getPoolAmount"],
        calls: callsArray,
      })
    ).output;
  },

  async getBankContractTokenState(block, markets, chain) {
    let bankAddress = await utility.getBankAddressByGlobalConfig(block, chain);
    let callsArray = [];
    markets.forEach((element) => {
      callsArray.push({
        target: bankAddress,
        params: element,
      });
    });
    return (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["bank:getTokenState"],
        calls: callsArray,
      })
    ).output;
  },

  // Get Token Value
  async getCtokenValue(block, ctoken, chain) {
    let cEthToken = await sdk.api.abi.call({
      block: block,
      chain: chain,
      target: ctoken,
      params: contracts[chain].SAVINGS_ADDRESS,
      abi: "erc20:balanceOf",
    });
    return cEthToken.output;
  },

  // Get Symbol
  async getSymbol(block, markets) {
    let callsArray = [];

    markets.forEach((element) => {
      callsArray.push({
        target: element,
      });
    });
    return (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: "erc20:symbol",
        calls: callsArray,
      })
    ).output;
  },

  // Get cTokens
  async getCTokens(block, markets, chain) {
    let tokenRegistryAddress =
      await utility.getTokenRegistryAddressByGlobalConfig(block, chain);
    let callsArray = [];
    let allTokenObj = {};
    markets.forEach((token_address) => {
      allTokenObj[token_address] = "";
      callsArray.push({
        target: tokenRegistryAddress,
        params: token_address,
      });
    });
    let cToken = (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["tokenRegistry:getCToken"],
        calls: callsArray,
      })
    ).output;

    let zeroCTokenAddress = "0x0000000000000000000000000000000000000000";
    cToken.forEach((item) => {
      if (item.success) {
        allTokenObj[item.input.params[0]] =
          item.output === zeroCTokenAddress ? "" : item.output;
      }
    });
    return allTokenObj;
  },
  //
  async handlerTokenApr(block, markets, chain) {
    // Year Total Blocks Number
    let yearTotalBlocksNumber = 365 * 24 * 60 * 4;

    let targetTokenObj = {};

    let allTokenObj = await utility.getCTokens(block, markets, chain);

    let ctokenMapToken = {};
    let callsCompArray = [];
    let capitalCompoundRatioArray = [];

    // Get capitalUtilizationRatio
    let bankAddress = await utility.getBankAddressByGlobalConfig(block, chain);
    let callsArray = [];
    markets.forEach((token_address) => {
      callsArray.push({
        target: bankAddress,
        params: token_address,
      });
    });
    let capitalUtilizationRatio = (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["bank:getCapitalUtilizationRatio"],
        calls: callsArray,
      })
    ).output;

    let tempValue = BigNumber(3).times(Math.pow(10, 16)).toFixed(0);
    capitalUtilizationRatio.forEach((item) => {
      if (allTokenObj[item.input.params[0]]) {
        callsCompArray.push({
          target: allTokenObj[item.input.params[0]],
        });
        capitalCompoundRatioArray.push({
          target: bankAddress,
          params: item.input.params[0],
        });
        ctokenMapToken[allTokenObj[item.input.params[0]]] =
          item.input.params[0];
      }

      if (item.success) {
        // ((capitalUtilizationRatio * 15*10**16)/10**18)+3*10**16;
        let notSupportCompBorrowRatePerBlock = BigNumber(item.output)
          .times(15 * Math.pow(10, 16))
          .div(Math.pow(10, 18))
          .plus(tempValue)
          .div(yearTotalBlocksNumber)
          .toFixed(0);

        targetTokenObj[item.input.params[0]] = {
          ctoken: allTokenObj[item.input.params[0]] || "",
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

    let supplyRatePerBlock = (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["ctoken:supplyRatePerBlock"],
        calls: callsCompArray,
      })
    ).output;

    let borrowRatePerBlock = (
      await sdk.api.abi.multiCall({
        block: block,
        abi: abi["ctoken:borrowRatePerBlock"],
        calls: callsCompArray,
      })
    ).output;

    // capitalCompoundRatioArray
    let getCapitalCompoundRatio = (
      await sdk.api.abi.multiCall({
        block: block,
        chain: chain,
        abi: abi["bank:getCapitalCompoundRatio"],
        calls: capitalCompoundRatioArray,
      })
    ).output;

    supplyRatePerBlock.forEach((item) => {
      if (item.success) {
        targetTokenObj[
          ctokenMapToken[item.input.target]
        ].supplyRatePerBlockComp = item.output;
      }
    });
    borrowRatePerBlock.forEach((item) => {
      if (item.success) {
        targetTokenObj[
          ctokenMapToken[item.input.target]
        ].borrowRatePerBlockComp = item.output;
      }
    });
    getCapitalCompoundRatio.forEach((item) => {
      if (item.success) {
        targetTokenObj[item.input.params[0]].capitalCompoundRatio = item.output;
      }
    });

    // handle borrowRatePerBlock / depositRatePerBlock
    Object.keys(targetTokenObj).forEach((token_address) => {
      let item = targetTokenObj[token_address];
      let borrowRatePerBlock;
      let depositRatePerBlock;
      if (item.ctoken) {
        let supplyRatePerBlockCompValue = BigNumber(item.supplyRatePerBlockComp)
          .times(0.4)
          .toFixed(0);
        let borrowRatePerBlockCompValue = BigNumber(item.borrowRatePerBlockComp)
          .times(0.6)
          .toFixed(0);
        // supply*0.4+borrow*0.6
        borrowRatePerBlock = BigNumber(supplyRatePerBlockCompValue)
          .plus(borrowRatePerBlockCompValue)
          .toFixed(0);

        // ((borrowRatePerBlock * capitalUtilizationRatio ) + ( supplyRatePerBlockComp * capitalCompoundRatio ))/10**18
        depositRatePerBlock = BigNumber(borrowRatePerBlock)
          .times(item.capitalUtilizationRatio)
          .plus(
            BigNumber(item.supplyRatePerBlockComp).times(
              item.capitalCompoundRatio
            )
          )
          .div(Math.pow(10, 18))
          .toFixed(0);

        // if deposit depositRatePerBlock is zero;
        // depositRatePerBlock = supplyRatePerBlockComp * 0.85
        if (depositRatePerBlock === "0") {
          depositRatePerBlock = BigNumber(item.supplyRatePerBlockComp || 0)
            .times(0.85)
            .toFixed(0);
        }
      } else {
        // Does not support CToken
        borrowRatePerBlock = item.notSupportCompBorrowRatePerBlock;

        // notSupportCompBorrowRatePerBlock * capitalUtilizationRatio / 10**18
        depositRatePerBlock = BigNumber(item.notSupportCompBorrowRatePerBlock)
          .times(item.capitalUtilizationRatio)
          .div(Math.pow(10, 18))
          .toFixed(0);
      }
      let depositApr = (
        (Math.pow(
          1 + depositRatePerBlock / Math.pow(10, 18),
          yearTotalBlocksNumber
        ) -
          1) *
        100
      ).toFixed(18);
      let borrowApr = (
        (Math.pow(
          1 + borrowRatePerBlock / Math.pow(10, 18),
          yearTotalBlocksNumber
        ) -
          1) *
        100
      ).toFixed(18);
      item.deposit_apr = depositApr;
      item.borrow_apr = borrowApr;
    });
    return targetTokenObj;
  },
  formatRates(tokensObj) {
    let result = {
      lend: {},
      borrow: {},
      supply: {},
    };
    Object.keys(tokensObj).forEach((tokenAddress) => {
      let tokenItem = tokensObj[tokenAddress];
      result.lend[tokenItem.symbol] =
        parseFloat(tokenItem.lend) > 0 ? tokenItem.lend : "0";
      result.borrow[tokenItem.symbol] =
        parseFloat(tokenItem.borrow) > 0 ? tokenItem.borrow : "0";
      result.supply[tokenItem.symbol] = tokenItem.supply;
    });
    return result;
  },
};

/*==================================================
        TVL
        ==================================================*/
async function tvl(timestamp, blockETH, chainBlocks) {
  return await ethereumTvl(timestamp, blockETH, chainBlocks);
}
async function ethereumTvl(timestamp, blockETH, chainBlocks) {
  const block = blockETH;
  const chain = "ethereum";
  return await getTvlByChain(timestamp, block, chain);
}
async function okexchainTvl(timestamp, blockETH, chainBlocks) {
  const block = chainBlocks["okexchain"];
  const chain = "okexchain";
  return await getTvlByChain(timestamp, block, chain);
}
async function getTvlByChain(timestamp, block, chain) {
  let config = contracts[chain];

  let balances = {};
  let networkAddressSymbol = chain === "ethereum" ? "" : `${chain}:`;
  if (!block || block > config.DEPLOY_BLOCK) {
    // Get all Tokens in the market
    let markets = await utility.getMarkets(block, chain);

    // Get Bank
    let banksPoolAmounts = await utility.getBankPoolAmounts(
      block,
      markets,
      chain
    );
    banksPoolAmounts.forEach((result) => {
      if (result.success === true) {
        balances[networkAddressSymbol + result.input.params] = result.output;
      }
    });

    // cETH value
    balances[networkAddressSymbol + config.CETH] = await utility.getCtokenValue(
      block,
      config.CETH,
      chain
    );
  }
  return balances;
}

/*==================================================
        Rates
        ==================================================*/
async function rates(timestamp, blockETH, chainBlocks) {
  return await ethereumRates(timestamp, blockETH, chainBlocks);
}
async function ethereumRates(timestamp, blockETH, chainBlocks) {
  const block = blockETH;
  const chain = "ethereum";
  return await getRatesByChain(timestamp, block, chain);
}
async function okexchainRates(timestamp, blockETH, chainBlocks) {
  const block = chainBlocks["okexchain"];
  const chain = "okexchain";
  return await getRatesByChain(timestamp, block, chain);
}
async function getRatesByChain(timestamp, block, chain) {
  let initTokens = {};
  if (block > 10819469) {
    // Get all Tokens in the market
    let markets = await utility.getMarkets(block, chain);

    // Create source data format
    let tokenSymbols = await utility.getSymbol(block, markets);
    tokenSymbols.forEach((item) => {
      if (item.success === true) {
        initTokens[item.input.target] = {
          symbol: item.output,
          lend: "0",
          borrow: "0",
          supply: "0",
        };
      } else {
        initTokens[item.input.target] = {
          symbol: "Unknown",
          lend: "0",
          borrow: "0",
          supply: "0",
        };
      }
    });

    // handle token supply
    let banksContractTokenState = await utility.getBankContractTokenState(
      block,
      markets,
      chain
    );
    banksContractTokenState.forEach((item) => {
      if (item.success === true) {
        initTokens[item.input.params[0]].supply = item.output.loans;
      }
    });

    // handle token APR
    let tokenAprInfoObj = await utility.handlerTokenApr(block, markets, chain);
    Object.keys(tokenAprInfoObj).forEach((token_address) => {
      initTokens[token_address].lend =
        tokenAprInfoObj[token_address].deposit_apr;
      initTokens[token_address].borrow =
        tokenAprInfoObj[token_address].borrow_apr;
    });
  }

  // Create output format
  let result = utility.formatRates(initTokens);
  return result;
}

/*==================================================
        Exports
        ==================================================*/
module.exports = {
  name: "DeFiner",
  website: "https://definer.org/",
  token: "FIN",
  category: "lending",
  tvl: sdk.util.sumChainTvls([ethereumTvl, okexchainTvl]),
  rates,
  term: "1 block",
  permissioning: "Open",
  variability: "Medium",
  ethereum: {
    tvl: ethereumTvl,
    rates: ethereumRates,
  },
  okexchain: {
    tvl: okexchainTvl,
    rates: okexchainRates,
  },
};
