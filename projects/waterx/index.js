const sui = require("../helper/chain/sui");

const CUSTODY_VAULT = "0xf27ebfd21ea4ea759beefb1c4385825e02ab6c50f57305abec601ea4522d04bd";

async function tvl(api) {
  const vaults = await sui.getDynamicFieldObjects({ parent: CUSTODY_VAULT });
  vaults.forEach(({ type, fields }) => {
    // type: ...::custody_vault::SingleVault<0x..::usdc::USDC>
    const coin = type.slice(type.indexOf("<") + 1, type.lastIndexOf(">"));
    api.add(coin, fields.balance);
  });
}

module.exports = {
  timetravel: false,
  methodology: "Counts the real stablecoin reserves (USDC, USDsui) locked in the WaterX custody vault (native_custody::custody_vault), the Peg Stability Module that backs every WaterX USD 1:1. This captures the protocol's full TVL — WLP liquidity, perp position collateral and idle account balances — since all of it is denominated in WaterX USD redeemable against these reserves.",
  sui: { tvl },
};
