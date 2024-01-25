const { ChainGrpcBankApi } = require("@injectivelabs/sdk-ts");
const { getNetworkEndpoints, Network } = require("@injectivelabs/networks");

const ILendPoolContractAddress = "inj1xjkfkfgjg60gh3duf5hyk3vfsluyurjljznwgu";
const ATOMdenom =
  "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9";
const USDTdenom = "peggy0xdAC17F958D2ee523a2206206994597C13D831ec7";
const INJdenom = "inj";
const TIAdenom =
  "ibc/F51BB221BAA275F2EBF654F70B005627D7E713AFFD6D86AFD1E43CAA886149F4";
const WETHdenom = "peggy0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function getCollateralBalance(denom, poolAddress) {
  const endpoints = getNetworkEndpoints(Network.Mainnet);

  const chainGrpcBankApi = new ChainGrpcBankApi(endpoints.grpc);

  const balance = await chainGrpcBankApi.fetchBalance({
    accountAddress: poolAddress,
    denom
  });

  return balance ? balance.amount : "0";
}

async function tvl(_, _1, _2) {
  const atomBalance = await getCollateralBalance(
    ATOMdenom,
    ILendPoolContractAddress
  );
  const usdtBalance = await getCollateralBalance(
    USDTdenom,
    ILendPoolContractAddress
  );
  const injBalance = await getCollateralBalance(
    INJdenom,
    ILendPoolContractAddress
  );
  const tiaBalance = await getCollateralBalance(
    TIAdenom,
    ILendPoolContractAddress
  );
  const wethBalance = await getCollateralBalance(
    WETHdenom,
    ILendPoolContractAddress
  );

  return {
    [ATOMdenom]: atomBalance,
    [USDTdenom]: usdtBalance,
    [INJdenom]: injBalance,
    [TIAdenom]: tiaBalance,
    [WETHdenom]: wethBalance,
    total: (
      Number(atomBalance) +
      Number(usdtBalance) +
      Number(injBalance) +
      Number(tiaBalance) +
      Number(wethBalance)
    ).toString()
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Counts the collateral balance of various tokens in the iLend pool on the Injective chain.",
  start: 1000235,
  injective: {
    tvl
  }
};
