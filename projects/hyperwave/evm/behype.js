const sdk = require('@defillama/sdk');
const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { BEHYPE_DEPLOYMENTS, HWHYPE_VAULT, HWHYPE_VAULT_TOKENS, ADDRESSES } = require('../constants');

async function behypeUnstaking(api) {
    const unclaimedIds = await sdk.api.abi.call({
        target: BEHYPE_DEPLOYMENTS.WITHDRAWALS_MANAGER,
        abi: "function getUserUnclaimedWithdrawals(address user) view returns (uint256[] ids)",
        chain: 'hyperliquid',
        params: [HWHYPE_VAULT],
    });
    
    const unstakes = await sdk.api.abi.multiCall({
        calls: unclaimedIds.output.map(id => ({
            target: BEHYPE_DEPLOYMENTS.WITHDRAWALS_MANAGER,
            params: [id],
        })),
        abi: "function withdrawalQueue(uint256 id) view returns (address user, uint256 beHypeAmount, uint256 hypeAmount, bool claimed)",
        chain: 'hyperliquid',
        permitFailure: true,
    })

    unstakes.output.forEach((unstake) => {
        if (!unstake.success) return;
        // console.log(data.output);
        const amount = unstake.output.hypeAmount;
        api.add(ADDRESSES.hyperliquid.WHYPE, amount);
    })

    return sumUnknownTokens({ api, useDefaultCoreAssets: true });
}

module.exports = {
    behypeUnstaking,
}