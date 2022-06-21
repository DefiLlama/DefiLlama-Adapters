const { ohmTvl } = require('../helper/ohm')

const treasury = "0xe35737c865968a6fcb13e536adcaa37d9be0c7eb"
module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, [
    ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", false],
    ["0xc97d37434766eec69d606c9038abaf8a6428e7da", true],
   ], "harmony", "0x6a4a847e83e923ab587cb3f395baaf1983f54bd6",
   "0xcda2fdeee5c382e401c04dc929e53ababf6c8109", addr=>`harmony:${addr}`, id=>id, false)
}