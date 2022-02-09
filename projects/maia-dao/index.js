const {ohmTvl} = require("../helper/ohm");

const maia = "0x6007fca39b5398feac4d06d75435a564a086bab8"
const maiaStaking = "0xE2546b144eFc3F8bd85d84b6CA64cC4F033c9be1";
const treasury = "0x3D183E4F3EeF0191eCFfaFd7fFC5Df8D38520Fa9";
const treasuryTokens = [
    ["0x82758824b93F2648bCC9387878CF443C9c0cB768", true], // MAIA-USDC TLP
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // USDC
    ["0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC", false], // USDT
    ["0x12D84f1CFe870cA9C9dF9785f8954341d7fbb249", false], // BUSD
    ["0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481", false], // WMETIS
    ["0x420000000000000000000000000000000000000A", false] // ETHER
]


module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "metis", maiaStaking, maia)
}
