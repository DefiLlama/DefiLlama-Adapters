const sdk = require('@defillama/sdk');
const _ = require('underscore');
const BigNumber = require("bignumber.js");
const abi = require('../helper/abis/aave.json');

async function getV2Reserves(block, addressesProviderRegistry, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping, dataHelperAddress) {
    if (v2Atokens.length !== 0 && v2ReserveTokens.length !== 0) return

    let validProtocolDataHelpers
    if(dataHelperAddress === undefined){

    const addressesProviders = (
      await sdk.api.abi.call({
        target: addressesProviderRegistry,
        abi: abi["getAddressesProvidersList"],
        block,
        chain
      })
    ).output;

    const protocolDataHelpers = (
      await sdk.api.abi.multiCall({
        calls: _.map(addressesProviders, (provider) => ({
          target: provider,
          params: "0x0100000000000000000000000000000000000000000000000000000000000000",
        })),
        abi: abi["getAddress"],
        block,
        chain
      })
    ).output;

    validProtocolDataHelpers = protocolDataHelpers.filter(
      (helper) =>
        helper.output !== "0x0000000000000000000000000000000000000000"
    ).map(p=>p.output);
    } else {
      validProtocolDataHelpers = dataHelperAddress
    }

    const aTokenMarketData = (
      await sdk.api.abi.multiCall({
        calls: _.map(validProtocolDataHelpers, (dataHelper) => ({
          target: dataHelper,
        })),
        abi: abi["getAllATokens"],
        block,
        chain
      })
    ).output;

    let aTokenAddresses = [];
    aTokenMarketData.map((aTokensData) => {
        aTokenAddresses = [
          ...aTokenAddresses,
          ...aTokensData.output.map((aToken) => aToken[1]),
        ];
    });

    const underlyingAddressesData = (
      await sdk.api.abi.multiCall({
        calls: _.map(aTokenAddresses, (aToken) => ({
          target: aToken,
        })),
        abi: abi["getUnderlying"],
        block,
        chain
      })
    ).output;

    let reserveAddresses = [];
    underlyingAddressesData.map((reserveData) => {
      reserveAddresses.push(reserveData.output)
    });

    v2Atokens = aTokenAddresses
    v2ReserveTokens = reserveAddresses;

    // Fetch associated token info
    const symbolsOfReserves = (
      await sdk.api.abi.multiCall({
        calls: _.map(v2ReserveTokens, (underlying) => ({
          target: underlying,
        })),
        abi: "erc20:symbol",
        block,
        chain
      })
    ).output;

    const decimalsOfReserves = (
      await sdk.api.abi.multiCall({
        calls: _.map(v2ReserveTokens, (underlying) => ({
          target: underlying,
        })),
        abi: "erc20:decimals",
        block,
        chain
      })
    ).output

    symbolsOfReserves.map((r) => {
      const address = r.input.target;
      let symbol;

      if (address == "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2") {
        symbol = "MKR";
      } else {
        symbol = r.output;
      }

      addressSymbolMapping[address] = { symbol };
    });

    decimalsOfReserves.map((r) => {
      const address = r.input.target;
      const existingAddress = addressSymbolMapping[address];
      addressSymbolMapping[address] = {
        ...existingAddress,
        decimals: r.output,
      };
    });
    return [v2Atokens, v2ReserveTokens, addressSymbolMapping]
  }

  async function getV2Tvl(block, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping) {
    const underlyingAddressesDict = Object.keys(v2ReserveTokens).map(
      (key) => v2ReserveTokens[key]
    );

    const balanceOfUnderlying = (
      await sdk.api.abi.multiCall({
        calls: _.map(v2Atokens, (aToken, index) => ({
          target: underlyingAddressesDict[index],
          params: aToken,
        })),
        abi: "erc20:balanceOf",
        block,
        chain
      })
    ).output;

    const v2Data = balanceOfUnderlying.map((underlying, index) => {
      const address = underlying.input.target
      return {
        aToken: v2Atokens[index],
        underlying: address,
        symbol: addressSymbolMapping[address].symbol,
        decimals: addressSymbolMapping[address].decimals,
        balance: underlying.output,
      };
    })

    return v2Data
  }

  function aaveChainTvl(chain, addressesProviderRegistry, transformAddress, dataHelperAddress){
      return async (timestamp, ethBlock, chainBlocks)=>{
    const balances = {}
    const block = chainBlocks[chain]
    let v2Atokens = [];
    let v2ReserveTokens = [];
    let addressSymbolMapping = {};
    [v2Atokens, v2ReserveTokens, addressSymbolMapping] = await getV2Reserves(block, addressesProviderRegistry, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping, dataHelperAddress)
    const v2Tvl = await getV2Tvl(block, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping);
    v2Tvl.map(data => {
      sdk.util.sumSingleBalance(balances, transformAddress?transformAddress(data.underlying):`${chain}:${data.underlying}`, data.balance);
    })
    return balances
  }
}
module.exports={
    aaveChainTvl,
    getV2Reserves,
    getV2Tvl
}