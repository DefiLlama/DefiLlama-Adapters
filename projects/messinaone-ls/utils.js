const { lookupApplications } = require("../helper/chain/algorand");

async function getAppState(appId) {
    const res = await lookupApplications(appId);
    return res.application.params["global-state"];
}

const readGlobalState = async (appIndex, key) => {
    const globalState = await getAppState(appIndex)
    const gsmap = new Map();

    globalState.forEach((item) => {
      const formattedKey = Buffer.from(item.key, 'base64').toString()
  
      let formattedValue
      if (item.value.type === 1) {
        formattedValue = Buffer.from(item.value.bytes, 'base64').toString()
      } else {
        formattedValue = item.value.uint
      }

      gsmap.set(formattedKey, formattedValue)
    })

    return gsmap.get(key)
};

module.exports = {
    readGlobalState,
};