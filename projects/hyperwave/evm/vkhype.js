const sdk = require('@defillama/sdk');
const { getLogs } = require("../../helper/cache/getLogs")
const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { VKHYPE_DEPLOYMENTS, HWHYPE_VAULT_START_BLOCK, HWHYPE_VAULT, HWHYPE_VAULT_TOKENS, ADDRESSES } = require('../constants');

async function vkhypeUnstaking(api) {
    /**
     * 1. Fetches active requests from the BoringOnchainQueue contract
     * 2. Fetches onchain withdraw requests from the BoringOnchainQueue contract
     * 3. Filters out requests that are not for HWHYPE vault
     * 4. Filters out requests that are not active
     * 5. Adds the amount of WHYPE to the balance
     */
    const activeRequests = await api.call({
        target: VKHYPE_DEPLOYMENTS.BORING_ONCHAIN_QUEUE,
        abi: 'function getRequestIds() view returns (bytes32[] requests)',
    })

    const onchainWithdrawRequests = await getLogs({
        api,
        target: VKHYPE_DEPLOYMENTS.BORING_ONCHAIN_QUEUE,
        // fromBlock: HWHYPE_VAULT_START_BLOCK,
        fromBlock: 19413700,
        eventAbi: "event OnChainWithdrawRequested(bytes32 indexed requestId, address indexed user, address indexed assetOut, uint96 nonce, uint128 amountOfShares, uint128 amountOfAssets, uint40 creationTime, uint24 secondsToMaturity, uint24 secondsToDeadline)",
        onlyArgs: true,
    })
    const hwhypeWithdrawRequests = onchainWithdrawRequests.filter((w) => w[1] === HWHYPE_VAULT)
    const pendingRequests = hwhypeWithdrawRequests.filter((w) => activeRequests.includes(w[0]))

    pendingRequests.forEach((w) => {
        const amount = w[5]
        api.add(ADDRESSES.hyperliquid.WHYPE, amount)
    })

    return sumUnknownTokens({ api, useDefaultCoreAssets: true })
}

module.exports = {
    vkhypeUnstaking,
}