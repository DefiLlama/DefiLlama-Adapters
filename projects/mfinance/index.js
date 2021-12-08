const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");

const masterChef = "0x342A8A451c900158BA4f1367C55955b5Fbcb7CCe";
const MG = "0x06b0c26235699b15e940e8807651568b995a8e01";

const lpPools2Addresses = [
    //MG-USDT
    "0x7D2a83dbfb562226666E75b08d55C6b226df9eDA",
    //MG-mLTC
    "0x497c43Ae0e33eA41E26Ad25fC43fC839c80574dF",
    //MG-mDASH
    "0xBE640fD7578194Ec77Ec4B5019888F6ddb44Ef5b",
    //MG-mXRP
    "0x30C8b5ff89b1e3781f29e4673648f076CfDa7C95",
    //MG-mBCH
    "0x9E6a59d1D52991e81d71A859Cf21320B1d47E066",
    //MG-mBSV
    "0x4c5F11Ce5e91BcFD822d9880361C2E18C7d7ff44",
    //MG-mDOT
    "0x19fE2F1b5e103e97FEe974A21a896501E5Ad9DDC"
];

const ignoreAddresses = lpPools2Addresses.concat([MG]);

const ethTvl = async (chainBlocks) => {
    const balances = {};

    await addFundsInMasterChef(
        balances,
        masterChef,
        chainBlocks["ethereum"],
        "ethereum",
        addr => addr,
        abi.poolInfo,
        ignoreAddresses
    );

    return balances;
};

module.exports = {
    ethereum: {
        staking: staking(masterChef, MG),
        pool2: pool2s([masterChef], lpPools2Addresses),
        tvl: ethTvl,
    },
  methodology:
    "TVL includes all farms in MasterChef contract",
};