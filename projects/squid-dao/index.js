const { ohmTvl } = require('../helper/ohm')

const treasury = "0x61d8a57b3919e9F4777C80b6CF1138962855d2Ca"
module.exports = ohmTvl(treasury, [
    ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", false],
    ["0xfad704847967d9067df7a60910399155fca43fe8", true]
], "ethereum", "0x5895b13da9beb11e36136817cdcf3c4fcb16aaea", "0x21ad647b8f4fe333212e735bfc1f36b4941e6ad2")