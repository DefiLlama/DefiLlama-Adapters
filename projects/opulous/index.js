const { lookupApplications } = require("../helper/chain/algorand");

async function staking() {
    
    const poolIds = [843061415, 1127413236, 1020347200];
    let totalPoolAmount = 0;

    for (const poolId of poolIds) {
        let response = await lookupApplications(poolId);

        for (const y of response.application.params["global-state"]) {
            let decodedKey = Buffer.from(y.key, 'base64').toString('binary');
            if (decodedKey === "pool_size") {
                // OPUL has 10 digits
                totalPoolAmount += y.value.uint / 1e10;
            }
        }
    }

    return {
        'opulous': totalPoolAmount
    };
}

module.exports = {
    // timetravel: true,
    // start: 1660827158,
    methodology: `Counts the number of OPUL tokens locked in the staking pool.`,
    algorand: {
        tvl: () => ({}),
        staking: staking
    }
};

// node test.js projects/opulous/index.js
