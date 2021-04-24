  const sdk = require("@defillama/sdk");
  const _ = require("underscore");
  const abi = require("./abi.json");
  const BigNumber = require("bignumber.js");
  const axios = require("axios")
  const {toUSDT, usdtAddress} = require("../helper/balances")
  
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

    /*
    const markets = await axios.get("https://api.for.tube/api/v1/bank/public/chain/BSC-Inno/markets")
    const bscUsd = markets.data.data.reduce((acc, val)=>acc+val.global_token_reserved, 0)
    sdk.util.sumSingleBalance(balances, usdtAddress, toUSDT(bscUsd));
    */
  
    return balances;
  }
  
  module.exports = {
    start: 1596384000, // 2020/8/3 00:00:00 +UTC
    tvl
  };
  
