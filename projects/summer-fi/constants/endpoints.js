const { getEnv } = require("../../helper/env");

const endpoints = {
  summerHistory: () => getEnv("SUMMER_HISTORY_ENDPOINT"),
  makerVaults: () => getEnv("SUMMER_CONFIRMED_VAULTS_ENDPOINT"),
};

module.exports = {
  endpoints,
};
