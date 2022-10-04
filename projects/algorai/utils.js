const {lookupApplications} = require("../helper/algorand");

async function getAppState(appId) {
    const res = await lookupApplications(appId);
    return res.application.params["global-state"];
}

/**
 * Calculate the sqrt of a bigint (rounded down to nearest integer)
 * @param value value to be square-rooted
 * @return bigint sqrt
 */
function sqrt(value) {
    if (value < BigInt(0))
        throw Error("square root of negative numbers is not supported");

    if (value < BigInt(2)) return value;

    function newtonIteration(n, x0) {
        const x1 = (n / x0 + x0) >> BigInt(1);
        if (x0 === x1 || x0 === x1 - BigInt(1)) return x0;
        return newtonIteration(n, x1);
    }

    return newtonIteration(value, BigInt(1));
}


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
                    if (key === "ad") {
                        foundedState[index] = algosdk.encodeAddress(Buffer.from(state.value.bytes, "base64"));
                    } else if (key === "rss") {
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
