const { ohmTvl } = require('../helper/ohm')

const treasury = "0xa3904e99b6012eb883db1090d02d4e954539ec61"
module.exports = ohmTvl(treasury, [
    ["0xcde0a00302cf22b3ac367201fbd114cefa1729b4", true],
    ["0x4dabf6c57a8bea012f1eaa1259ceed2a62ac7df2", true],
    ["0xf8838fcc026d8e1f40207acf5ec1da0341c37fe2", true],
    ["0x224e64ec1bdce3870a6a6c777edd450454068fec", false],
], "harmony", "0xeea71889c062c135014ec34825a1958c87a2ac61", "0xed0b4b0f0e2c17646682fc98ace09feb99af3ade")