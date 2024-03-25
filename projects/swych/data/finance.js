const { Pool } = require("../constants/contracts");
const TOKENS = require("../constants/tokens");
const {sumTokens2} = require("../../helper/unwrapLPs");

const fetchTotalPoolAmount = async (api) => {
    return sumTokens2({
        api,
        owner: Pool,
        tokens: Object.values(TOKENS),
        chain: "bsc",
    });
};

module.exports = {
    fetchTotalPoolAmount,
};
