const { nASTR, AvaultPool } = require("./constants");

module.exports = {
    remap: (balances) => {
        balances['astar'] = balances['astar'] + balances[nASTR] / 1e18; // Map nASTR to ASTR since nASTR is 1:1 pegged.
        // remap
        AvaultPool.forEach(t => balances['dai'] += +balances[t] / 1e18);
        [nASTR, ...AvaultPool].forEach(t => delete balances[t]);
        return balances;
    }
}