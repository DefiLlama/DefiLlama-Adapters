const { call } = require("../helper/chain/elrond");

const taoLiquidStakingAddress =
    "erd1qqqqqqqqqqqqqpgqhykmg59ny8tem37m0gng3ygwtphmefyz78ssfecn6q";
const swtao = "SWTAO-356a25";

const tvl = async (api) => {
    const cashReserve = await call({
        target: taoLiquidStakingAddress,
        abi: "getCash",
        responseTypes: ["number"],
    });
    api.addTokens([swtao], [cashReserve.toString()]);
};

module.exports = {
    timetravel: false,
    elrond: {
        tvl,
    },
};
