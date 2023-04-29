const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { default: BigNumber } = require("bignumber.js");
const addressesProviderRegistry = "0x9D8bB85b1c728f69672923dD4A0209EC8b75EFda"; // from https://sio2-finance.gitbook.io/en/development/contract-addresses

async function getReserves(block) {
  const chain = "astar";
  const addressesProviders = (
    await sdk.api.abi.call({
      target: addressesProviderRegistry,
      abi: abi["getAddressesProvidersList"],
      block,
      chain,
    })
  ).output;

  const protocolDataHelpers = (
    await sdk.api.abi.multiCall({
      calls: addressesProviders.map((provider) => ({
        target: provider,
        params:
          "0x0100000000000000000000000000000000000000000000000000000000000000",
      })),
      abi: abi["getAddress"],
      block,
      chain,
    })
  ).output;

  const validProtocolDataHelpers = protocolDataHelpers
    .filter(
      (helper) => helper.output !== ADDRESSES.null
    )
    .map((p) => p.output);

  const sTokenMarketData = (
    await sdk.api.abi.multiCall({
      calls: validProtocolDataHelpers.map((dataHelper) => ({
        target: dataHelper,
      })),
      abi: abi["getAllSTokens"],
      block,
      chain,
    })
  ).output;

  let sTokenAddresses = [];
  sTokenMarketData.map((sTokensData) => {
    sTokenAddresses = [
      ...sTokenAddresses,
      ...sTokensData.output.map((sToken) => sToken[1]),
    ];
  });
  const underlyingAddressesData = (
    await sdk.api.abi.multiCall({
      calls: sTokenAddresses.map((sToken) => ({
        target: sToken,
      })),
      abi: abi["getUnderlying"],
      block,
      chain,
    })
  ).output;

  const reserveAddresses = underlyingAddressesData.map(
    (reserveData) => reserveData.output
  );
  return [sTokenAddresses, reserveAddresses, validProtocolDataHelpers[0]];
}

async function getSio2Tvl(
  balances,
  block,
  chain,
  sTokens,
  reserveTokens,
  transformAddress
) {
  const balanceOfUnderlying = await sdk.api.abi.multiCall({
    calls: sTokens.map((sToken, index) => ({
      target: reserveTokens[index],
      params: sToken,
    })),
    abi: "erc20:balanceOf",
    block,
    chain,
  });

  sdk.util.sumMultiBalanceOf(
    balances,
    balanceOfUnderlying,
    true,
    transformAddress
  );
}

module.exports = {
  getReserves,
  getSio2Tvl,
};
