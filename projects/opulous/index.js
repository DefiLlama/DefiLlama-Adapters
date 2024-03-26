const { lookupApplications } = require("../helper/chain/algorand");

async function algorandStaking() {
    
    const poolIds = [843061415, 1127413236, 1020347200,929851093];
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
const arbitrumTVL = async (api) => {
    // getting the total supply of OVault tokens
    const LPSupply = await api.call({ abi: 'uint256:LPSupply', target: '0xF27181a734BF6bd2bbbdFA8bdfcdef066759EdBa'  })
    // convert OVault tokens to USDC using the LPToUsdc function
    const TVL = await api.call({ abi: 'function LPToUsdc(uint256 LPNAmount) public view returns (uint256)', target: '0xF27181a734BF6bd2bbbdFA8bdfcdef066759EdBa' , params: LPSupply})
    // getting the USDC token address
    const USDCToken = await api.call({ abi: 'address:usdcToken', target: '0xF27181a734BF6bd2bbbdFA8bdfcdef066759EdBa'  })
    // adding the USDC TVL to the balances
    api.add(USDCToken, TVL)
}

module.exports = {
    //     // start: 1660827158,
    methodology: `Counts the number of OPUL tokens locked in the staking pool.`,
    algorand: {
        tvl: () => ({}),
        staking: algorandStaking
    },
    arbitrum: {
        tvl: () => ({}),
        borrowed: arbitrumTVL,
    }
};

// node test.js projects/opulous/index.js
