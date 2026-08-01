const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
    sonic: {
        token: "0x5fd9cd00c975ccedb4298a562d132fb2683164d9",
        contract: "0x486b750b2DB5d8B1548A78319F6CF8D95501Ff58"
    },
};

async function tvl(_, _1, _2, { api }) {
    const { token, contract } = config.sonic;
    return sumTokens2({ api, owner: contract, tokens: [token] });
}

module.exports = {
    methodology: "TVL is calculated based on the total balance of Spindash tokens locked in the protocol's smart contract.",
    sonic: { tvl },
};
