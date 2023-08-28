const { lookupApplications } = require("../helper/chain/algorand");

/**
 * @desc Read global state from algorand application
 *
 * @param appId
 * @returns {Promise<*>}
 */
async function getAppState(appId) {
    const res = await lookupApplications(appId);
    return res.application.params["global-state"];
}

/**
 * @desc Given an encoded string, return its decoded string.
 *
 * @param str
 * @returns {*}
 */
const decodeString = (str) => {
    return Buffer.from(str, "base64").toString("binary");
};

/**
 * Given an application ID, return the application information including creator,
 * approval and clear programs, global and local schemas, and global state.
 * @param appIndex - index
 * @param keys - Asset keys to find.
 */
const readGlobalState = async (appIndex, keys) => {
    const states = await getAppState(appIndex)

    const foundedState = [];

    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const stateKey = decodeString(state.key);

        keys.forEach((key, index) => {
            if (key === stateKey) {
                foundedState[index] = state.value.uint;
            }
        });

    }
    return foundedState
};

module.exports = {
    readGlobalState,
};
