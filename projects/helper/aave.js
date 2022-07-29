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

async function getTvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress) {
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

async function getBorrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress, v3 = false) {
  const reserveData = await sdk.api.abi.multiCall({
      calls: v2ReserveTokens.map((token) => ({
        target: dataHelper,
        params: [token],
      })),
      abi: v3 ? abi.getTotalDebt : abi.getHelperReserveData,
      block,
      chain
    });

    reserveData.output.forEach((data, idx)=>{
      const quantity = v3 ? data.output : BigNumber(data.output.totalVariableDebt).plus(data.output.totalStableDebt).toFixed(0)
      sdk.util.sumSingleBalance(balances, transformAddress(data.input.params[0]), quantity)
    })
}

function aaveChainTvl(chain, addressesProviderRegistry, transformAddressRaw, dataHelperAddresses, borrowed, v3 = false) {
  const transformAddress = transformAddressRaw ? transformAddressRaw : addr=>`${chain}:${addr}`
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {}
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    const [v2Atokens, v2ReserveTokens, dataHelper] = await getV2Reserves(block, addressesProviderRegistry, chain, dataHelperAddresses)
    if(borrowed){
      await getBorrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress, v3);
    } else {
      await getTvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress);
    }
    return balances
  }
}
function aaveExports(chain, addressesProviderRegistry, transform = undefined, dataHelpers = undefined){
  return {
    tvl: aaveChainTvl(chain, addressesProviderRegistry, transform, dataHelpers, false),
    borrowed: aaveChainTvl(chain, addressesProviderRegistry, transform, dataHelpers, true)
  }
}
module.exports = {
  aaveChainTvl,
  getV2Reserves,
  getTvl,
  aaveExports,
  getBorrowed,
}