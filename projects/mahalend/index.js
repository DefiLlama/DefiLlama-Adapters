const sdk = require("@defillama/sdk");
const { getTvl, getBorrowed } = require("../helper/aave");
const abi = require("../helper/abis/aave.json");

const protocolDataHelper = "0xCB5a1D4a394C4BA58999FbD7629d64465DdA70BC";

const getReserves = async (block) => {
  const aTokenMarketData = (
    await sdk.api.abi.call({
      target: protocolDataHelper,
      abi: abi["getAllATokens"],
      block,
      chain: "ethereum",
    })
  ).output;

  const aTokenAddresses = aTokenMarketData.map((aToken) => aToken[1]);

  const underlyingAddressesData = (
    await sdk.api.abi.multiCall({
      calls: aTokenAddresses.map((aToken) => ({
        target: aToken,
      })),
      abi: abi["getUnderlying"],
      block,
      chain: "ethereum",
    })
  ).output;

  const reserveAddresses = underlyingAddressesData.map(
    (reserveData) => reserveData.output
  );

  return {
    aTokenAddresses,
    reserveAddresses,
  };
};

async function tvl(_, block) {
  const balances = {};
  const { reserveAddresses, aTokenAddresses } = await getReserves(block);
  await getTvl(balances, block, "ethereum", aTokenAddresses, reserveAddresses);
  return balances;
}

async function borrowed(_, block) {
  const balances = {};

  const { reserveAddresses } = await getReserves(block);
  await getBorrowed(
    balances,
    block,
    "ethereum",
    reserveAddresses,
    protocolDataHelper,
    (a) => a,
    true
  );

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.`,
  ethereum: {
    tvl,
    borrowed,
  },
};

// node test.js projects/mahalend/index.js
