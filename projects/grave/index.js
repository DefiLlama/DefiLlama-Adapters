const sdk = require("@defillama/sdk");
const { stakingPricedLP } = require("../helper/staking");
const { transformAvaxAddress  } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { pool2Exports } = require("../helper/pool2");

const GRAVE = "0x3700a92dd231F0CaC37D31dBcF4c0f5cCb1db6Ca"
const GSHARE = "0xffe04bf98c7111360bf7a6c56b343915543cd941"
const GenMasterchef = "0x6ee714a7c17309b57b85a61a161621acb66dbbd9"
const ASYLUM = "0xDa1fe319C8C295A26102f40b680bF4beB7afF6c4"
const GShareRewardPool = "0xF051dB01326355303A24bEa002409dcD71d396a0"

const graveAvaxLp = "0x10e882acfae3cf63e96741fabc41c19025e7be2a"
const gShareAvaxLp = "0xae427ad7a54f5490ef76b3bde3663b0e45c7a102"


async function atvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformAvaxAddress();
    await sumTokensAndLPsSharedOwners(
		balances,
		[
			["0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", false],
			["0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", false],
			["0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", false],
			["0x070092b3A985f9E5424351D68730c9A318ad96eb", false],
			
		],
		[GenMasterchef],
		chainBlocks.avax,
		"avax",
		transform,
	);
    

    return balances;
};

const pool2LPs = [
    graveAvaxLp,
    gShareAvaxLp,
  ];
  
module.exports = {
    avalanche: {
        tvl: atvl,
        pool2: pool2Exports(GShareRewardPool,pool2LPs,"avax"),
        staking: stakingPricedLP(ASYLUM, GSHARE, "avax", gShareAvaxLp, "wrapped-avax")
    }   
};