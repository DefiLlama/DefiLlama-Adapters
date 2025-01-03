const utils = require("../helper/utils");

async function fetchTVL() {
    const response = await utils.fetchURL("https://bot-api.prod.iloop.finance/v1/total-tvl");
    return Number(response.data.data);
}

module.exports = {
    timetravel: false,
    solana: {
        fetch: fetchTVL,
    },
    fetch: fetchTVL,
    methodology: 'TVL consists of deposits made to the protocol, borrowed tokens are not counted.',
};
