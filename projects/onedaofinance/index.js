const { ohmTvl } = require('../helper/ohm')
const { fixHarmonyBalances } = require('../helper/portedTokens')

const replacements = {
    "0x224e64ec1bdce3870a6a6c777edd450454068fec":"0xa47c8bf37f92abed4a126bda807a7b7498661acd", //UST
}

module.exports=ohmTvl("0xcdC825e5Fc3D5af362dAF887D4EDc4c73c072EdE", [
    ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", false],
    ["0x224e64ec1bdce3870a6a6c777edd450454068fec", false],
    ["0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f", false],
    ["0x985458e523db3d53125813ed68c274899e9dfab4", false],
    ["0x4f658217f163509115b6e1fbba37cd9aefbdba12", true],
    ["0x34f21378A6fc29acc1eACB82bC5F7deC794Ce537", true],
    ["0x171fF11B53674958C273bCFCcBc731aa6cae96F8", true],
], "harmony", "0x9cAc73eA219e5F8a96485c937E2C8A617f7F4f37", "0x947394294F75D7502977AC6813FD99f77C2931ec",addr=>{
    return replacements[addr] || `harmony:${addr}`}, fixHarmonyBalances)