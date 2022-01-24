const {ohmTvl} = require("../helper/ohm");

const blanc = "0xf481Eec738C46F675e077ee966A680a19210Af11";
const stakingContract = "0x1b6CD48f1148FF53e61809a68bca74b384B8C630";
const treasuryContract = "0x76EcB72ffeEb0Bf57869758c9bf020F45d0a04d0";

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasuryContract, [
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
        ["0x9B4E1cFD1417cBa22a2fb2B7cbdd8dcC1dc1e7C7", true], // BLANC-MIM
        ["0x0FB87c2dA68CC565f380DDE4A5cdafd6F5A315b0", true], // BLANC-WAVAX
    ], "avax", stakingContract, blanc, undefined, undefined, false)
}