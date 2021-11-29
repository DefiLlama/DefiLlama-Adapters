const { Port } = require("@port.finance/port-sdk");
const { WalletId } = require("@port.finance/port-sdk/lib/models/WalletId");

async function tvl() {
  const port = Port.forMainNet();
  const reserveContext = await port.getReserveContext();
  const portBalance = await port.getPortBalance(
    WalletId.fromBase58("HNS2DL8GQRBk4ju2kHzfQDyCmkd5B4eeU3sjDp24f28i"),
    reserveContext
  );
  const usdcCollateral = portBalance
    .getCollaterals()[0]
    .getRecordedValue()
    .toNumber();
  const usdcBorrow = portBalance.getLoans()[0].getRecordedValue().toNumber();
  return {
    "usd-coin": usdcCollateral - usdcBorrow,
  };
}

module.exports = {
  tvl,
};
