const { ohmTvl } = require('../helper/ohm')

const token = "0x057E0bd9B797f9Eeeb8307B35DbC8c12E534c41E";
const stakingContract = "0x4Eef9cb4D2DA4AB2A76a4477E9d2b07f403f0675";
const treasury = "0x05d0a05c1fd3a00ca1fc7a4a7321552c0dd80521";

const treasuryContracts = [
    ["0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", false], // DAI
    ["0x7c9B16d845FE163F464d265193cC2B4eE3faC326", true] // GURU-DAI SLP
]

module.exports = {
    deadFrom: 1648765747,
    ...ohmTvl(treasury, treasuryContracts, "polygon", stakingContract, token)
}
