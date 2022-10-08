const {uniTvlExport} = require("../helper/calculateUniTvl")

const degg = "0xFD71FC52D34eD1Cfc8363e5528285B12b6b942c2";
const duckyFactory = "0x796E38Bb00f39a3D39ab75297D8d6202505f52e2";

module.exports = {
    cronos: {
        tvl: uniTvlExport(duckyFactory, "cronos")
    }
}
