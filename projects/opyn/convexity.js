/*==================================================
  Modules
==================================================*/

const sdk = require('@defillama/sdk');
const _ = require('underscore');
const BigNumber = require('bignumber.js');

const getNumberOfOptionsContractsAbi = require('./abis/convexity/getNumberOfOptionsContracts.json');
const optionsContractsAbi = require('./abis/convexity/optionsContracts.json');
const collateralAbi = require('./abis/convexity/collateral.json');

/*==================================================
  Settings
==================================================*/

const factoriesAddresses = [
  "0xb529964F86fbf99a6aA67f72a27e59fA3fa4FEaC",
  "0xcC5d905b9c2c8C9329Eb4e25dc086369D6C7777C"
]

/*==================================================
  TVL
==================================================*/

module.exports = async function tvl(timestamp, block) {  
  const supportedTokens = await (
    sdk
      .api
      .util
      .tokenList()
      .then((supportedTokens) => supportedTokens.map(({ contract }) => contract))
  );

  let balances = {};

  for(let i = 0; i < factoriesAddresses.length; i++) {
    // number of created oTokens
    let numberOfOptionsContracts = (
      await sdk.api.abi.call({
        target: factoriesAddresses[i],
        abi: getNumberOfOptionsContractsAbi,
      })
    ).output;

    // batch getOptionsContracts calls
    let getOptionsContractsCalls = [];

    for(let j = 0; j < numberOfOptionsContracts; j++) {
      getOptionsContractsCalls.push({
        target: factoriesAddresses[i],
        params: j
      })
    }

    let optionsContracts = (
      await sdk.api.abi.multiCall({
        calls: getOptionsContractsCalls,
        abi: optionsContractsAbi,
        block
      })
    ).output;

    // list of options addresses
    let optionsAddresses = []

    _.each(optionsContracts, async (contracts) => {
      if(contracts.output != null) {
        optionsAddresses = [
          ...optionsAddresses,
          contracts.output
        ]  
      }
    });    
    
    // batch getCollateralAsset calls
    let getCollateralAssetCalls = [];

    _.each(optionsAddresses, (optionAddress) => {
      getCollateralAssetCalls.push({
        target: optionAddress
      })
    })

    // get list of options collateral assets
    let optionsCollateral = (
      await sdk.api.abi.multiCall({
        calls: getCollateralAssetCalls,
        abi: collateralAbi,
        block
      })
    ).output;

    let optionsCollateralAddresses = []

    _.each(optionsCollateral, async (collateralAsset) => {     
      // only consider supported tokens   
      if((collateralAsset.output.toLowerCase() != null) && (collateralAsset.output.toLowerCase() !== "0x0000000000000000000000000000000000000000") && (supportedTokens.includes(collateralAsset.output.toLowerCase())) && (!optionsCollateralAddresses.includes(collateralAsset.output.toLowerCase())) ) {
        optionsCollateralAddresses = [
          ...optionsCollateralAddresses,
          collateralAsset.output.toLowerCase()
        ]  
      }
    });

    // get ETH balance
    _.each(optionsAddresses, async (optionAddress) => {
      let balance = (await sdk.api.eth.getBalance({target: optionAddress, block})).output;
      balances["0x0000000000000000000000000000000000000000"] = BigNumber(balances["0x0000000000000000000000000000000000000000"] || 0).plus(BigNumber(balance)).toFixed();
    })

    // batch balanceOf calls
    let balanceOfCalls = [];

    _.each(optionsCollateralAddresses, async (optionCollateralAddress) => {
      optionsAddresses.forEach((optionAddress) => {
        balanceOfCalls.push({
          target: optionCollateralAddress,
          params: [optionAddress]
        });  
      })
    });

    // get tokens balances
    const balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: balanceOfCalls,
      abi: "erc20:balanceOf"
    });

    await sdk.util.sumMultiBalanceOf(balances, balanceOfResults);
  }

  return balances;
}