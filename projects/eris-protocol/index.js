const axios = require("axios");

const contracts = {
  terra2_hub:
    "terra10788fkzah89xrdm27zkj5yvhj9x3494lxawzm5qq3vvxcqz2yzaqyd3enk",
};

const queryPhoenix = async function (url, block) {
  let endpoint = `${
    process.env["TERRA_RPC"] ?? "https://phoenix-lcd.terra.dev"
  }${url}`;

  let headers = undefined;
  if (block !== undefined) {
    headers = {
      "x-cosmos-block-height": block,
    };
  }
  return (await axios.get(endpoint, { headers })).data.data;
};

async function terra2Tvl() {
  const queryStr = `{"state": {}}`;
  const base64Str = Buffer.from(queryStr).toString("base64");
  const res = await queryPhoenix(
    `/cosmwasm/wasm/v1/contract/${contracts.terra2_hub}/smart/${base64Str}`
  );

  return {
    "terra-luna-2": +res.tvl_uluna / 1e6,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Liquid Staking and Arbitrage Protocol",
  terra2: { tvl: terra2Tvl },
};
