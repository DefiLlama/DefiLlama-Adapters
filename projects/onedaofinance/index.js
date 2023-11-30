const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')
const { getFixBalancesSync } = require('../helper/portedTokens')

const replacements = {
    "0x224e64ec1bdce3870a6a6c777edd450454068fec":"0xa47c8bf37f92abed4a126bda807a7b7498661acd", //UST
}

module.exports= {
    deadFrom: 1648765747,
    
    ...ohmTvl("0xcdC825e5Fc3D5af362dAF887D4EDc4c73c072EdE", [
    ["0xe176ebe47d621b984a73036b9da5d834411ef734", false], // BUSD
    ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", false], // DAI
    ["0xeb6c08ccb4421b6088e581ce04fcfbed15893ac3", false], // FRAX
    ["0x34f21378a6fc29acc1eacb82bc5f7dec794ce537", true], // ODAO-ETH SLP
    ["0x171ff11b53674958c273bcfccbc731aa6cae96f8", true], // ODAO-WONE SLP
    ["0x4f658217f163509115b6e1fbba37cd9aefbdba12", true], // ODAO-DAI SLP
    ["0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f", false], // USDT
    ["0x985458e523db3d53125813ed68c274899e9dfab4", false], // USDC
    [ADDRESSES.harmony.WONE, false], // WONE
    ["0x224e64ec1bdce3870a6a6c777edd450454068fec", false] // WUST
], "harmony", "0x9cAc73eA219e5F8a96485c937E2C8A617f7F4f37", "0x947394294F75D7502977AC6813FD99f77C2931ec",addr=>{
    return replacements[addr] || `harmony:${addr}`}, getFixBalancesSync('harmony'))
}