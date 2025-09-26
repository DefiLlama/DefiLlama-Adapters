const sui = require("../helper/chain/sui");

async function suiTVL() {
  const { api } = arguments[3];

  const vaultInfo = await sui.getObject("0x42d122b64fb242eb3149a3cccd45a8ceb3165140ce3beadca9dc0450be5d5a5d");
  api.add(
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      vaultInfo.fields.supply_usdc
    );

}

module.exports = {
  sui: {
    tvl: suiTVL,
  },
};
