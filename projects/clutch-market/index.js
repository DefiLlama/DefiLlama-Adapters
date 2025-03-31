const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
    arbitrum: [
        {
            token: "0xF4AcDE4D938844751f34659C67056f7e69dBE85a",
            contract: "0x2F849Bf926E457CE57dF4f8C24eEA0d33Fa04672"
        },
        {
            token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            contract: "0x9797dA129eaFA143E8A50028563b69Cc02ea6444"
        }
    ]
};

async function tvl(_, _1, _2, { api }) {
    const tokensAndOwners = config.arbitrum.map(({ token, contract }) => [token, contract]);
    return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
    methodology: "TVL is calculated based on the total balance of multiple tokens locked in different contracts on Arbitrum.",
    arbitrum: { tvl },
};
