const { nullAddress,sumTokens2 } = require('../helper/unwrapLPs');
const { stakingPricedLP } = require("../helper/staking");

// Contract addresses
const MegadropBBB = "0x37c00AE5C4b49Ab0F5fD2FFB1033588e9bC33B08";  // Megadrop BBB
const BBB = "0xfa4ddcfa8e3d0475f544d0de469277cf6e0a6fd1";          // BBB Token
const XDC_BBB_LP = "0x95ab47ff0056cdc81a42b35d96551d9c5534947d";   // XDC-BBB LP Token
const BBBPump = "0x2E24BFdE1EEDa0F1EA3E57Ba7Ff10ac6516ab5Ec";      // BBBPump
const Stake="0x2B3Bb9b3265Fcee484e857506fDCf2C0776E9c43";
const psXDC="0x9B8e12b0BAC165B86967E771d98B520Ec3F665A6";




async function bbbPumpTvl(api) {
    const totalSupply = await api.call({ abi: 'erc20:balanceOf', target: psXDC,params: [Stake] })
    api.addGasToken(totalSupply)
    const toa=[[nullAddress,BBBPump]]
    return sumTokens2({ tokensAndOwners: toa, api })
 
 
}

module.exports = {
    start: '2024-10-10',
    xdc: {
        tvl: bbbPumpTvl,
        staking: stakingPricedLP(MegadropBBB, BBB, "xdc", XDC_BBB_LP, "wrapped-xdc"),
    },
};