const sdk = require('@defillama/sdk');
const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { KHYPE_DEPLOYMENTS, HWHYPE_VAULT, HWHYPE_VAULT_TOKENS, ADDRESSES } = require('../constants');

async function khypeUnstaking(api) {
    const nextId = (
        await sdk.api.abi.call({
            target: KHYPE_DEPLOYMENTS.STAKING_MANAGER,
            abi: "function nextWithdrawalId(address user) view returns (uint256 nextId)",
            chain: "hyperliquid",
            params: [HWHYPE_VAULT],
        })
    ).output

    const ids = Array.from({ length: Number(nextId) }, (_, i) => i);
    const unstakes = await sdk.api.abi.multiCall({
        calls: ids.map(i => ({ 
            target: KHYPE_DEPLOYMENTS.STAKING_MANAGER, 
            params: [
                HWHYPE_VAULT,
                i
            ] 
        })),
        abi: "function withdrawalRequests(address user, uint256 id) view returns ( uint256 hypeAmount, uint256 kHYPEAmount, uint256 kHYPEFee, uint256 bufferUsed, uint256 timestamp)",
        chain: 'hyperliquid',
        permitFailure: true, 
    })

    unstakes.output.forEach((data, i) => {
        if (!data.success) return;
        // console.log(data.output);
        const amount = data.output.hypeAmount;
        api.add(ADDRESSES.hyperliquid.WHYPE, amount);
    })

    return sumUnknownTokens({ api, useDefaultCoreAssets: true });
}

module.exports = {
    khypeUnstaking,
}