const axios = require("axios");

const { encodeBase64 } = require("./helpers.js");

const GRPC_API_URL = "https://lcd.terra.dev";
const STEAK_HUB = "terra15qr8ev2c0a0jswjtfrhfaj5ucgkhjd7la2shlg";

async function tvl() {
  const queryMsg = { state: {} };

  const response = await axios.get(
    `${GRPC_API_URL}/terra/wasm/v1beta1/contracts/${STEAK_HUB}/store?query_msg=${encodeBase64(queryMsg)}`
  );

  return {
    "terra-luna": parseInt(response.data.query_result.total_uluna) / 1e6,
  };
}

module.exports = { tvl };
