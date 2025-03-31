const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
    arbitrum: {
        token: "0xF4AcDE4D938844751f34659C67056f7e69dBE85a",
        contract: "0x2F849Bf926E457CE57dF4f8C24eEA0d33Fa04672"
    },
};

async function tvl(_, _1, _2, { api }) {
    const { token, contract } = config.arbitrum;
    return sumTokens2({ api, owner: contract, tokens: [token] });
}

module.exports = {
    methodology: "TVL is calculated based on the total balance of tokens locked in the protocol's smart contract.",
    arbitrum: { tvl },
};
