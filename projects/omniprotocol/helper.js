const sdk = require("@defillama/sdk");
const abiOmni = require("./omni.json");

async function getOmniReserves(
  block,
  chain,
  validProtocolDataHelper
) {
  const validProtocolDataHelpers = [validProtocolDataHelper];

  const aTokenMarketData = (
    await sdk.api.abi.multiCall({
      calls: validProtocolDataHelpers.map((dataHelper) => ({
        target: dataHelper,
      })),
      abi: abiOmni["getAllOTokens"],
      block,
      chain,
    })
  ).output;

  const reserveTokenMarketData = (
    await sdk.api.abi.multiCall({
      calls: validProtocolDataHelpers.map((dataHelper) => ({
        target: dataHelper,
      })),
      abi: abiOmni["getAllReservesTokens"],
      block,
      chain,
    })
  ).output;

  let aTokenAddresses = [];
  aTokenMarketData.map((aTokensData) => {
    aTokenAddresses = [
      ...aTokenAddresses,
      ...aTokensData.output.map((aToken) => aToken[1]),
    ];
  });

  let reserveAddresses = [];
  reserveTokenMarketData.map((aTokensData) => {
    reserveAddresses = [
      ...reserveAddresses,
      ...aTokensData.output.map((aToken) => aToken[1]),
    ];
  });

  return [aTokenAddresses, reserveAddresses, validProtocolDataHelpers[0]];
}

async function getTvl(
  block,
  chain,
  ntokens,
  reserveTokens,
) {
  const balanceOfUnderlying = await sdk.api.abi.multiCall({
    calls: ntokens.map((aToken, index) => ({
      target: reserveTokens[index],
      params: aToken,
    })),
    abi: "erc20:balanceOf",
    block,
    chain,
  });

  return balanceOfUnderlying.output.map(({ input, output }) => ({
    asset: input.target,
    output,
  }));
}

async function getBorrowed(
  block,
  chain,
  reserveTokens,
  dataHelper,
) {
  const reserveData = await sdk.api.abi.multiCall({
    calls: reserveTokens.map((token) => ({
      target: dataHelper,
      params: token,
    })),
    abi: abiOmni["getReserveData"],
    block,
    chain,
  });

  return reserveData.output.map(({ input, output }) => ({
    asset: input.params[0],
    variable: output.totalVariableDebt,
    stable: output.totalStableDebt,
  }));
}

module.exports = {
  getTvl,
  getBorrowed,
  getOmniReserves,
};