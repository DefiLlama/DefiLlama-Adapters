const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { BEHYPE_DEPLOYMENTS, HWHYPE_VAULT, HWHYPE_VAULT_TOKENS, ADDRESSES } = require('../constants');

async function behypeUnstaking(api) {
    const unclaimedIds = await api.call({
        target: BEHYPE_DEPLOYMENTS.WITHDRAWALS_MANAGER,
        abi: "function getUserUnclaimedWithdrawals(address user) view returns (uint256[] ids)",
        params: [HWHYPE_VAULT],
    });

    const unstakes = await api.multiCall({
        calls: unclaimedIds.map(id => ({
            target: BEHYPE_DEPLOYMENTS.WITHDRAWALS_MANAGER,
            params: [id],
        })),
        abi: "function withdrawalQueue(uint256 id) view returns (address user, uint256 beHypeAmount, uint256 hypeAmount, bool claimed)",
        permitFailure: true,
    })

    unstakes.forEach((unstake) => {
        if (!unstake) return;
        const amount = unstake.hypeAmount;
        api.add(ADDRESSES.hyperliquid.WHYPE, amount);
    })

    return sumUnknownTokens({ api, useDefaultCoreAssets: true });
}

module.exports = {
    behypeUnstaking,
}