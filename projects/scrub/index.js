const { tombTvl } = require("../helper/tomb")

const lion = '0x49fB98F9b4a3183Cd88e7a115144fdf00fa6fB95'
const share = "0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0";

const masonry = "0x05CaB739FDc0A4CE0642604c78F307C6c543cD6d";
const rewardPool = "0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800";

const pool2lps = [
	'0xD440433dAA33b3e3f2b5421046EAf84bEe6F40D0', // LION-SVN LP
	'0xaDeC6aaAa0765472EE9eBe524BD3454Fd733BAB9', // TIGER-SVN LP
]

module.exports = {
    ...tombTvl(lion, share, rewardPool, masonry, pool2lps, "cronos", undefined, false, pool2lps[1])
}