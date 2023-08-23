const sdk = require('@defillama/sdk')
const abi = require("./abi.js");
const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB"
const LOCKER = "0x4e4c89937f85bd101c7fcb273435ed89b49ad0b0"

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, fetchBalances: true, permitFailure: true })

async function getLocked(a, b, c, { api }) {
    const lockers = await api.call({
        target: LOCKER,
        abi: abi["depositsCount"],
        params: []
    })

    const calls = [];

    for (let i = 1; i <= lockers; i++) {
        calls.push({
            target: LOCKER,
            function: abi["lockedToken"],
            params: [i]
        });
    }

    const locks = await api.multiCall({ abi: abi["lockedToken"], calls: calls })

    const balances = {};
    locks.forEach(lock => {
        const key = `base:${lock.token}`;
        const value = lock.amount;
        if (!lock.withdrawn) {
            balances[key] = value;
        }
    });
    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $BSWAP and $BSX staking.`,
    base: {
        tvl: sdk.util.sumChainTvls([dexTVL, getLocked]),
    }
};
