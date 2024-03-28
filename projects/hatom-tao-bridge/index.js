const { call } = require("../helper/chain/elrond");

const wrappedTaoContractAddress =
    "erd1qqqqqqqqqqqqqpgqajq8kvm8qq045s2fvj4sa7dph8kpqx9d78ssxjzjdh";
const wtao = "WTAO-4f5363";

const tvl = async (api) => {
    const totalSupply = await call({
        target: wrappedTaoContractAddress,
        abi: "getTokenSupply",
        responseTypes: ["number"],
    });
    api.addTokens([wtao], [totalSupply.toString()]);
};

module.exports = {
    timetravel: false,
    elrond: {
        tvl,
    },
};
