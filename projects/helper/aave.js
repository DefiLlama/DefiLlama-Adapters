const sdk = require('@defillama/sdk');
const abi = require('../helper/abis/aave.json');
const { getBlock } = require('./getBlock');

async function getV2Reserves(block, addressesProviderRegistry, chain, dataHelperAddress) {
  let validProtocolDataHelpers
  if (dataHelperAddress === undefined) {
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
        calls: addressesProviders.map((provider) => ({
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
    ).map(p => p.output);
  } else {
    validProtocolDataHelpers = dataHelperAddress
  }

  const aTokenMarketData = (
    await sdk.api.abi.multiCall({
      calls: validProtocolDataHelpers.map((dataHelper) => ({
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
      calls: aTokenAddresses.map((aToken) => ({
        target: aToken,
      })),
      abi: abi["getUnderlying"],
      block,
      chain
    })
  ).output;

  const reserveAddresses = underlyingAddressesData.map((reserveData) => reserveData.output);

  return [aTokenAddresses, reserveAddresses]
}

async function getV2Tvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress) {
  const balanceOfUnderlying = await sdk.api.abi.multiCall({
      calls: v2Atokens.map((aToken, index) => ({
        target: v2ReserveTokens[index],
        params: aToken,
      })),
      abi: "erc20:balanceOf",
      block,
      chain
    });
  sdk.util.sumMultiBalanceOf(balances, balanceOfUnderlying, true, transformAddress)
}

function aaveChainTvl(chain, addressesProviderRegistry, transformAddress, dataHelperAddress) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {}
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    const [v2Atokens, v2ReserveTokens] = await getV2Reserves(block, addressesProviderRegistry, chain, dataHelperAddress)
    const transformAddressFinal = transformAddress ? transformAddress : addr=>`${chain}:${addr}`
    await getV2Tvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddressFinal);
    return balances
  }
}
module.exports = {
  aaveChainTvl,
  getV2Reserves,
  getV2Tvl
}