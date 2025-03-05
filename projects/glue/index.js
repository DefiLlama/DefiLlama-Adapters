const { ApiPromise, WsProvider } = require("@polkadot/api");
const { waitReady } = require("@polkadot/wasm-crypto");

const CONFIG = {
    name: 'glue',
    decimals: 18,
    relaychainWsUrl: 'wss://mainnet-relay-ws.m11.glue.net',
}

async function getRelaychainApi() {
    const relaychainProvider = new WsProvider(CONFIG.relaychainWsUrl);
    const api = await ApiPromise.create({ provider: relaychainProvider });
    await waitReady();
    return api;
}

module.exports = {
    [CONFIG.name]: {
        tvl: async () => {
            try {
                const api = await getRelaychainApi();

                const totalLockedAmount = await api.query.nominationPools.totalValueLocked();
                const bonded = await api.query.staking.erasTotalStake(1);

                const lockedValue = BigInt(totalLockedAmount.toString());
                const bondedValue = BigInt(bonded.toString());

                const totalValueLockedAtomic = lockedValue + bondedValue;

                const totalValueLocked = Number(totalValueLockedAtomic) / 10 ** CONFIG.decimals;

                return {
                    [CONFIG.name]: totalValueLocked,
                };
            } catch (error) {
                console.error(error);
                throw error;
            }
        }
    }
};