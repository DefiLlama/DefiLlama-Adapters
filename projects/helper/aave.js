const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const abi = require('./abis/aave.json');
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

  return [aTokenAddresses, reserveAddresses, validProtocolDataHelpers[0]]
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

async function getV2Borrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress) {
  const reserveData = await sdk.api.abi.multiCall({
      calls: v2ReserveTokens.map((token) => ({
        target: dataHelper,
        params: [token],
      })),
      abi: abi.getHelperReserveData,
      block,
      chain
    });
    reserveData.output.forEach((data, idx)=>{
      sdk.util.sumSingleBalance(balances, transformAddress(data.input.params[0]), BigNumber(data.output.totalVariableDebt).plus(data.output.totalStableDebt).toFixed(0))
    })
}

function aaveChainTvl(chain, addressesProviderRegistry, transformAddressRaw, dataHelperAddress, borrowed) {
  const transformAddress = transformAddressRaw ? transformAddressRaw : addr=>`${chain}:${addr}`
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {}
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    const [v2Atokens, v2ReserveTokens, dataHelper] = await getV2Reserves(block, addressesProviderRegistry, chain, dataHelperAddress)
    if(borrowed){
      await getV2Borrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress);
    } else {
      await getV2Tvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress);
    }
    return balances
  }
}
function aaveExports(chain, addressesProviderRegistry){
  return {
    tvl: aaveChainTvl(chain, addressesProviderRegistry, undefined, undefined, false),
    borrowed: aaveChainTvl(chain, addressesProviderRegistry, undefined, undefined, true)
  }
}
module.exports = {
  aaveChainTvl,
  getV2Reserves,
  getV2Tvl,
  aaveExports
}