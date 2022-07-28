const { tombTvl } = require("../helper/tomb")

const lion = '0x49fB98F9b4a3183Cd88e7a115144fdf00fa6fB95'
const share = "0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0";

const masonry = "0x05CaB739FDc0A4CE0642604c78F307C6c543cD6d";
const rewardPool = "0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800";

const pool2lps = [
	'0xF2059ed015EC4eCC80f902d9FDBCd2A227BFE037', // LION-USDC LP
	'0xf6464c80448d6Ec4Deb7e8E5eC95B8EB768fBf69', // TIGER-USDC LP
	'0x3D9E539FA44B970605658E25D18F816ce78C4007', // BEAR-WBTC LP
]

module.exports = {
    ...tombTvl(lion, share, rewardPool, masonry, pool2lps, "cronos", undefined, false, pool2lps[1])
}
