/*==================================================
  Modules
  ==================================================*/

  const sdk = require("@defillama/sdk");
  const _ = require("underscore");
  const abi = require("./abi.json");
  const BigNumber = require("bignumber.js");
  
  /*==================================================
      Settings
      ==================================================*/
  const ForTube = "0xE48BC2Ba0F2d2E140382d8B5C8f261a3d35Ed09C";
  const ForTubeV2 = "0x936E6490eD786FD0e0f0C1b1e4E1540b9D41F9eF";
  const EthAddress = "0x0000000000000000000000000000000000000000";
  const EthAddressV2 = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const V2BLOCK = 10808868;
  
  async function getCollateralMarketsLength(block) {
    return (
      await sdk.api.abi.call({
        block,
        target: ForTube,
        params: [],
        abi: abi["getCollateralMarketsLength"],
      })
    ).output;
  }
  
  // returns [addresses]
  async function getErc20Assets(block) {
    let erc20Assets = [];
    let calls = [];
    let length = await getCollateralMarketsLength(block);
    for (var i = 0; i < length; i++) {
      calls.push({
        target: ForTube,
        params: i,
      });
    }
    let erc20AssetResults = await sdk.api.abi.multiCall({
      block,
      calls: calls,
      abi: abi["collateralTokens"],
    });
    _.each(erc20AssetResults.output, (result) => {
      if (result.success && result.output != EthAddress) {
        erc20Assets.push(result.output);
      }
    });
  
    return erc20Assets;
  }
  
  async function allUnderlyingMarkets(block) {
    let fTokens = await getAllMarkets(block);
    let erc20AssetsV2 = [];
    let underlyings = await sdk.api.abi.multiCall({
      block,
      calls: _.map(fTokens, (fToken) => ({
        target: fToken,
        params: [],
      })),
      abi: abi['underlying']
    });

    _.each(underlyings.output, (result) => {
      if (result.success && result.output != EthAddressV2) {
        erc20AssetsV2.push(result.output);
      }
    });
    return erc20AssetsV2;
  }

  async function getAllMarkets(block) {
    return (await sdk.api.abi.call({
      block,
      target: ForTubeV2,
      abi: abi['getAllMarkets'],
    })).output;
  }

  async function multiGet(name, block) {
    let fTokens = await getAllMarkets(block);
    return (await sdk.api.abi.multiCall({
      block,
      calls: _.map(fTokens, (fToken) => ({
        target: fToken,
        params: [],
      })),
      abi: abi[name],
    })).output;
  }

  async function getUnderlyingInfo(ftoken, block) {
    let underlying = (await sdk.api.abi.call({
      block,
      target: ftoken,
      params: [],
      abi: abi["underlying"],
    })).output;

    if (underlying == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      return { decimals: 18, symbol: "ETH" }
    }

    if (underlying == "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2") {
      return { decimals: 18, symbol: "MKR" }
    }

    let info = await sdk.api.erc20.info(underlying);
    return { decimals: info.output.decimals, symbol: info.output.symbol }
  }

  /*==================================================
      TVL
      ==================================================*/
  async function tvl(timestamp, block) {
    let balances = {};
    let erc20Assets = await getErc20Assets(block);
  
    // Get erc20 assets locked
    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: _.map(erc20Assets, (asset) => ({
        target: asset,
        params: ForTube,
      })),
      abi: "erc20:balanceOf",
    });
  
    //add ETH tvl
    balances[EthAddress] = (
      await sdk.api.eth.getBalance({ target: ForTube, block })
    ).output;

    //10808868 is First Deposit Tx blockNumber in ForTube V2
    if (block > V2BLOCK) {
      const ethBalance2 = (await sdk.api.eth.getBalance({ target: ForTubeV2, block })).output;
      balances[EthAddress] = BigNumber(balances[EthAddress]).plus(ethBalance2).toFixed();

      let erc20AssetsV2 = await allUnderlyingMarkets(block);
      let balanceOfResultsV2 = await sdk.api.abi.multiCall({
        block,
        calls: _.map(erc20AssetsV2, (assetV2) => ({
          target: assetV2,
          params: ForTubeV2,
        })),
        abi: "erc20:balanceOf",
      });

      sdk.util.sumMultiBalanceOf(balances, balanceOfResultsV2);
    }

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults);
  
    return balances;
  }
  
  /*==================================================
    Rates
    ==================================================*/
  async function rates(timestamp, block) {
    let ratesData = { lend: {}, borrow: {}, supply: {} };
    let allAssets = await getErc20Assets(block);
    allAssets.push(EthAddress);
  
    const mktsResults = (await sdk.api.abi.multiCall({
      block,
      calls: _.map(allAssets, (asset) => ({
        target: ForTube,
        params: asset,
      })),
      abi: abi['mkts'],
    })).output;
    await (Promise.all(mktsResults.map(async (market) => {
      if (market.success) {
        const asset = market.input.params[0];
        var symbol = "ETH";
        var decimals = 18;
        if (asset == "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2") {
          symbol = "MKR";//MKR's symbol type is bytes32, not string
          decimals = 18;
        } else if (asset != EthAddress) {
          let info = await sdk.api.erc20.info(asset);
          symbol = info.output.symbol;
          decimals = info.output.decimals;
        }
  
        ratesData.lend[symbol] = String((market.output.supplyRate / 1e18) * 100);
        ratesData.borrow[symbol] = String((market.output.demondRate / 1e18) * 100);
        ratesData.supply[symbol] = BigNumber(market.output.totalBorrows).div(10 ** decimals).toFixed();
      }
    })));

    //V2
    if (block > V2BLOCK) {
      let APRs = await multiGet('APR', block);
      let APYs = await multiGet('APY', block);
      let Supplies = await multiGet('totalBorrows', block);

      await (Promise.all(APRs.map(async (APR) => {
        if (APR.success) {
          let info = await getUnderlyingInfo(APR.input.target, block);
          ratesData.borrow[info.symbol] = String((APR.output / 1e18) * 100);
        }
      })));

      await (Promise.all(APYs.map(async (APY) => {
        if (APY.success) {
          let info = await getUnderlyingInfo(APY.input.target, block);
          ratesData.lend[info.symbol] = String((APY.output / 1e18) * 100);
        }
      })));

      await (Promise.all(Supplies.map(async (supply) => {
        if (supply.success) {
          let info = await getUnderlyingInfo(supply.input.target, block);
          ratesData.supply[info.symbol] = BigNumber(supply.output).div(10 ** info.decimals).toFixed();
        }
      })));
    }

    return ratesData;
  }
  
  /*==================================================
      Exports
      ==================================================*/
  
  module.exports = {
    name: "ForTube",
    website: 'https://for.tube',
    token: "FOR",
    category: "lending",
    start: 1596384000, // 2020/8/3 00:00:00 +UTC
    tvl,
    rates,
    term: '1 block',
    permissioning: 'Open',
    variability: 'Medium',
  };
  
