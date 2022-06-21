const { ohmTvl } = require('../helper/ohm')

const treasury = "0x9EF8600b0f107c083F9df557e0Ddf12E071E75fe"
module.exports = ohmTvl(treasury, [
    //USDC
    ["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", false],
    //MIM
    ["0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", false],
    //sushi LP
    ["0xe4ad045abb586dbdae6b11a4d2c6ff5434b93ed1", true],
    //
    ["0xcf4f4f341b60587513b8fc01482237996c7e3fd3", true],
   ], "arbitrum", "0x51568924623E66110ffFAc620e948caD8555Ea98", "0x86b3353387f560295a8fa7902679735e5f076bd5")