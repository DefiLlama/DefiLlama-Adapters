const { treasuryExports } = require("../helper/treasury");

const treasuryAddress = "0xfF16fd3D147220E6CC002a8e4a1f942ac41DBD23";

module.exports = treasuryExports({
    base: { owners: [treasuryAddress], },
    optimism: { owners: [treasuryAddress], },
    avax: { owners: [treasuryAddress] }
})