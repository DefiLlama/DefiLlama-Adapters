const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0xBc461eA008c586a1721c6bF6a712f38e199A3Ce7" 
const miniPantherToken = "0x3264810174f577F82DDD4FD08818F368AC363505"
const stakingAddress = "0x7dc10Ade8599bf5033577F60C6740479aa39DB41"
const treasuryTokens = [
    ["0x9cbccdaf10153edd092817a013470a0693852a77", false], //PantherUSD
    [ADDRESSES.fantom.WFTM, false], //WFTM
    [ADDRESSES.fantom.WBTC, false], //WBTC
    ["0x74b23882a30290451A17c44f4F05243b6b58C76d", false], //WETH
    [ADDRESSES.fantom.DAI, false], //DAI
    [ADDRESSES.fantom.MIM, false], //MIM
    ["0x761D6a950c8F441D616f34d6D918230936a3F27b", true], //MiniPanther-DAI
   ]


   module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "fantom", stakingAddress, miniPantherToken, addr=>{
        return `fantom:${addr}`
    }, (balances)=>{delete balances["fantom:0x9cbccdaf10153edd092817a013470a0693852a77"]}, false)
}
