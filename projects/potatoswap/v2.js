const { getUniTVL } = require("../helper/unknownTokens");

// --- V2 ---
const v2Factory = "0x630db8e822805c82ca40a54dae02dd5ac31f7fcf"
const v2Tvl = getUniTVL({
    factory: v2Factory,
    useDefaultCoreAssets: true,
});

module.exports = {
  v2Tvl,
};