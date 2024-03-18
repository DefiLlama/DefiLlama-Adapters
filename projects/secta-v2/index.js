const { getUniTVL } = require("../helper/unknownTokens");

const defaultExport = {
  tvl: getUniTVL({
    factory: "0x8Ad39bf99765E24012A28bEb0d444DE612903C43",
    useDefaultCoreAssets: true,
  }),
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://www.secta.finance/info as the source.",
  linea: defaultExport,
};
