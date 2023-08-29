const axios = require("axios");
const config = require("../config.json");

module.exports =
  (chain) =>
  async (_, _1, _2, { api }) => {
    const query = {
      id: 1,
      jsonrpc: "2.0",
      method: "invokefunction",
    };

    const options = {
      method: "get",
      url: `${config[chain].api}/tvl`,
      data: query,
    };

    const response = await axios(options);
    api.add(config[chain].contracts.token, response.data.bigNumber);
  };
