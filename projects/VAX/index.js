const { calculateUniTvl } = require("../helper/calculateUniTvl");

const factory = "0xbaC576111e2BC5EfBbE7c5d765b9DC44083901fD"

const translate = {	//temporary hack
    "multivac:0xEa1199d50Ee09fA8062fd9dA3D55C6F90C1bABd2": "0x6B175474E89094C44Da98b954EedeAC495271d0F",		//Bridged USDC -> Mainnet USDC
    "multivac:0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8": "bsc:0x8aa688AB789d1848d131C65D98CEAA8875D97eF1",	//WMTV of MultiVAC -> Bridged MTV of BSC
}

async function tvl(timestamp, block, chainBlocks) {
    let balances =  await calculateUniTvl(addr=>`multivac:${addr}`, chainBlocks.multivac, "multivac", factory, 0, true);
    for (key in translate) {
        balances[translate[key]] = balances[key];
        delete balances[key]
    }
    return balances
}

module.exports = {
    multivac: {
        tvl,
    }
}