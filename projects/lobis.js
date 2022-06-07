const { ohmTvl } = require('./helper/ohm')

const treasury = "0x873ad91fA4F2aA0d557C0919eC3F6c9D240cDd05"
module.exports = ohmTvl(treasury, [
    //curve 
    ["0xD533a949740bb3306d119CC777fa900bA034cd52", false],
    //frax
    ["0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", false],
    //Sushi LP
    ["0x2734f4a846d1127f4b5d3bab261facfe51df1d9a", true],
], "ethereum", "0x3818eff63418e0a0ba3980aba5ff388b029b6d90", "0xdec41db0c33f3f6f3cb615449c311ba22d418a8d")
