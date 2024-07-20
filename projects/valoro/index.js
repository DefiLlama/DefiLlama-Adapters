const { call } = require("../helper/chain/elrond");

const proxyScAddress =
    "erd1qqqqqqqqqqqqqpgqqvj2zrdfv4lsc38p8cvh4e0yd4av6njfu7zsj7ztzl";
const usdc = "USDC-c76f1f";

const tvl = async (api) => {
    const cash = await call({
        target: proxyScAddress,
        abi: "getTotalNetAssetsValue",
        responseTypes: ["number"],
    });
    api.addTokens([usdc], [cash.toString()]);
};

module.exports = {
    timetravel: false,
    elrond: {
        tvl,
    },
};
