const axios = require("axios");


async function tvl() {
  const query = {
      "id": 1,
      "jsonrpc": "2.0",
      "method": "invokefunction",
      "params": [
        "0x340720c7107ef5721e44ed2ea8e314cce5c130fa",
        "balanceOf",
        [{"type": "Hash160", "value": "afdd6abedf066ff8c5fbc868cc89f80eac467142"}]
      ]
    };

  const options = {
      method: "post",
      url: "http://seed2.neo.org:10332",
      data: query,
    };

    const response = await axios(options);
    const nudes_amount = response.data.result.stack[0].value;
    return {nudes: parseFloat(nudes_amount / 10 ** 8)};
}

module.exports = {

  methodology: `TVL is obtained by making calls on NEO N3 RPC node.`,
  misrepresentedTokens: true,
  timetravel: false,
  neo: {
    tvl: () => ({}),
    staking: tvl
  }
}
