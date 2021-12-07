const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");

const masterChef = "0x9942cb4c6180820E6211183ab29831641F58577A";
const PNDA = "0x47DcC83a14aD53Ed1f13d3CaE8AA4115f07557C0";

const lpPools2Addresses = [
    //PNDA-DAI
    "0x7C8BA77476A3E713b27E7c1450227A0fF3411616",
    //PNDA-USDC
    "0xbe01056Bc0e29eb28c9c357c227e320Afd12776C",
    //PNDA-BUSD
    "0x0810E97C9FA4cCCebe559509edf74b650B432dcE",
    //PNDA-WBNB
    "0x97f6665ac6b2d7C3d5a2aD11d7a779787F617ce0",
    //PNDA-ETH
    "0x059fC92273CdF0809ba45f199E0a12d8899Ab402",
];


const bscTvl = async (chainBlocks) => {
    const balances = {};

    let transForm = await transformBscAddress();
    await addFundsInMasterChef(
        balances,
        masterChef,
        chainBlocks["bsc"],
        "bsc",
        transForm,
        abi.poolInfo,
        [],
        true,
        true,
        PNDA
    );

    return balances;
};

module.exports = {
    bsc: {
        staking: staking(masterChef, PNDA, "bsc"),
        pool2: pool2s([masterChef], lpPools2Addresses, "bsc"),
        tvl: bscTvl,
    },
  methodology:
    "TVL includes all farms in MasterChef contract",
};