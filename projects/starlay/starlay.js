const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { default: BigNumber } = require("bignumber.js");
const addressesProviderRegistry = "0xF6206297b6857779443eF7Eca4a3cFFb1660F952";

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
      (helper) => helper.output !== "0x0000000000000000000000000000000000000000"
    )
    .map((p) => p.output);

  const lTokenMarketData = (
    await sdk.api.abi.multiCall({
      calls: validProtocolDataHelpers.map((dataHelper) => ({
        target: dataHelper,
      })),
      abi: abi["getAllLTokens"],
      block,
      chain,
    })
  ).output;

  let lTokenAddresses = [];
  lTokenMarketData.map((lTokensData) => {
    lTokenAddresses = [
      ...lTokenAddresses,
      ...lTokensData.output.map((lToken) => lToken[1]),
    ];
  });
  const underlyingAddressesData = (
    await sdk.api.abi.multiCall({
      calls: lTokenAddresses.map((lToken) => ({
        target: lToken,
      })),
      abi: abi["getUnderlying"],
      block,
      chain,
    })
  ).output;
  const reserveAddresses = underlyingAddressesData.map(
    (reserveData) => reserveData.output
  );
  return [lTokenAddresses, reserveAddresses, validProtocolDataHelpers[0]];
}

async function getStarlayTvl(
  balances,
  block,
  chain,
  lTokens,
  reserveTokens,
  transformAddress
) {
  const balanceOfUnderlying = await sdk.api.abi.multiCall({
    calls: lTokens.map((lToken, index) => ({
      target: reserveTokens[index],
      params: lToken,
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
  getStarlayTvl,
};
