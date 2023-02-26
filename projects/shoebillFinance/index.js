const { ethers } = require("ethers/lib");
const { toUSDTBalances } = require("../helper/balances");
const { protocolDataProviderAbi } = require("./abi");

const shoebillDataProviderAddress =
  "0xBdc26Ba6a0ebFD83c76CEf76E8F9eeb7714A5884";

const ethersProvider = new ethers.providers.JsonRpcProvider(
  "https://klaytn.blockpi.network/v1/rpc/public"
);

const dataProvider = new ethers.Contract(
  shoebillDataProviderAddress,
  protocolDataProviderAbi,
  ethersProvider
);

async function getTvl(timestamp, ethBlock, chainBlocks, { api }) {
  const aggregatedData = await dataProvider.getAllAggregatedReservesData();

  const data = aggregatedData.map((e) => {
    return {
      address: e.token.externalAddress,
      tvl: e.overview.availableLiquidity
        .add(e.overview.totalVariableDebt)
        .mul(e.oraclePrice)
        .toString(),
      decimal: e.configuration.decimals,
      borrowed: e.overview.totalVariableDebt.mul(e.oraclePrice),
    };
  });
  const totalSupplyTvl =
    data.reduce((a, b) => a + b.tvl / 10 ** b.decimal, 0) / 1e8;
  const borrowed =
    data.reduce((a, b) => a + b.borrowed / 10 ** b.decimal, 0) / 1e8;

  return toUSDTBalances(totalSupplyTvl);
}
async function getBorrowed(timestamp, ethBlock, chainBlocks, { api }) {
  const aggregatedData = await dataProvider.getAllAggregatedReservesData();

  const data = aggregatedData.map((e) => {
    return {
      decimal: e.configuration.decimals,
      borrowed: e.overview.totalVariableDebt.mul(e.oraclePrice),
    };
  });
  const borrowed =
    data.reduce((a, b) => a + b.borrowed / 10 ** b.decimal, 0) / 1e8;

  return toUSDTBalances(borrowed);
}
module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  klaytn: {
    tvl: getTvl,
    borrowed: getBorrowed,
  },
};
