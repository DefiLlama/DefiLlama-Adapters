const {lookupApplications} = require("../helper/algorand");

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
    return new Promise(async (resolve, reject) => {
        const states = await getAppState(appIndex)

        const foundedState = [];

        for (let i = 0; i < states.length; i++) {
            const state = states[i];
            const stateKey = decodeString(state.key);

            keys.forEach((key, index) => {
                if (key === stateKey) {
                    if (key === "rss") {
                        foundedState[index] = decodeString(state.value.bytes);
                    } else {
                        foundedState[index] = state.value.uint;
                    }
                }
            });

        }
        resolve(foundedState);
    });
};


/**
 * @desc The median of a sorted array of size N is defined as the middle element when N is odd and average of middle two elements when N is even
 *
 * @param arr1
 * @returns {number|*}
 */
const medianFromArray = (arr1) => {
    let concat = arr1;
    concat = concat.sort(
        function (a, b) {
            return a - b
        });

    let length = concat.length;

    if (length % 2 === 1) {
        return concat[(length / 2) - .5]
    } else {
        return (concat[length / 2]
            + concat[(length / 2) - 1]) / 2;
    }
}


module.exports = {
    readGlobalState,
    medianFromArray
};
