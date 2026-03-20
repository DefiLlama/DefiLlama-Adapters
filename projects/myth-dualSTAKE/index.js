const { getApplicationBoxes, getAppGlobalState } = require("../helper/chain/algorand")

const registryAppId = 2933409454

async function getDualSTAKEAppIDs() {
    const registryBoxes = await getApplicationBoxes({ appId: registryAppId });
    const boxKeys = registryBoxes.map(({ name: base64Key }) => Buffer.from(base64Key, 'base64'));
    const applicationIDs = boxKeys
        .filter(key => key[0] === 97) // app boxes prefixed with "a"
        .map(key => parseInt(key.slice(1).toString("hex"), 16))

    return applicationIDs
}

async function getStake() {
    const appIds = await getDualSTAKEAppIDs()
    let tvl = 0;
    for (const appId of appIds) {
        const { staked } = await getAppGlobalState(appId)
        tvl += staked
    }
    return { algorand: tvl / 1e6 }
}

module.exports = {
    timetravel: false,
    methodology: 'Returns total amount staked on the Myth Finance dualSTAKE protocol.',
    algorand: {
        tvl: async () => {
            return getStake()
        },
    }
}