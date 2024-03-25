const {fetchTotalPoolAmount} = require("./data/finance");
const {EVENTS} = require("./data/events");


module.exports = {
    bsc: {
        tvl: fetchTotalPoolAmount
    },
    hallmarks: EVENTS,
};
