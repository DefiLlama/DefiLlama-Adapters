const BTC_MARKET = "0xB7C609cFfa0e47DB2467ea03fF3e598bF59361A5"
const USDT = "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb"

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDT,
    params: [BTC_MARKET],
  });

  api.add(USDT, collateralBalance)
}

module.exports = {
  methodology: 'Sum of all USDT deposits in BTC Market',
  start: 6195000,
  hyperliquid: {
    tvl,
  }
};
