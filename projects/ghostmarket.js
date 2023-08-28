const axios = require("axios");


async function tvl() {
  const query = {
      "id": 1,
      "jsonrpc": "2.0",
      "method": "invokefunction",
      "params": [
        "0x9b049f1283515eef1d3f6ac610e1595ed25ca3e9",
        "balanceOf",
        [{"type": "Hash160", "value": "b91888ba149f267ad91817822bf2adaa0e3aa697"}]
      ]
    };

  const options = {
      method: "post",
      url: "http://seed2.neo.org:10332",
      data: query,
    };

    const response = await axios(options);
    const gm_amount = response.data.result.stack[0].value;
    return {ghostmarket: parseFloat(gm_amount / 10 ** 8)};
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
