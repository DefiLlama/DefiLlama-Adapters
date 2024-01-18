const { sumTokensExport } = require("../helper/unwrapLPs");

const contracts = [
  "0x4FDbc784f09BEAcEFCBDcBD7c724015416edcE53", // Protocol & Incentives
  "0xD59321c8266534dac369F0eFABDD5b815F1a5eb6", // Treasury
  "0xE894BD5Ec531EC8AAe856AFC3E0Fc948Ab22Efb4", // Staking
  "0x51DD193630806aDCFFa9E72569a71A9c12591C33", // Reserve
  "0x68C685Fd52A56f04665b491D491355a624540e85", // UniSwap v3
];

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: contracts,
      tokens: ["0xf1264873436A0771E440E2b28072FAfcC5EEBd01"],
    }),
  },
};
