const { getEnv } = require("../../helper/env");

const endpoints = {
  aave: () => getEnv("SUMMER_HISTORY_ENDPOINT"),
  ajna: () => getEnv("SUMMER_AJNA_ENDPOINT"),
  makerVaults: () => getEnv("SUMMER_CONFIRMED_VAULTS_ENDPOINT"),
};

module.exports = {
  endpoints,
};
