const { pool2 } = require("../helper/pool2");

const farm = "0xFa435cc7b37A1E3E404bBE082D48d83F2fAA3d10";
const lpToken = "0x7ae960972d668B2651261e9D4Fc40d4D983dc524"

module.exports = {
    bsc: {
        tvl: () => ({}),
        pool2: pool2(farm, lpToken),
    },
    methodology: "TVL counts JADE-WBNB LP tokens staked in farm",
}