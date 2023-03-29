const { nullAddress, treasuryExports } = require("../helper/treasury");

const LidoTreasury = "0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c";
const LDO = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',//stETH
        '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',//MATIC
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x2eE543b8866F46cC3dC93224C6742a8911a59750',//MVDG
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',//HSF
        '0x232FB065D9d24c34708eeDbF03724f2e95ABE768',//SHEESHA
        '0x0d02755a5700414B26FF040e1dE35D337DF56218' //BEND
     ],
    owners: [LidoTreasury],
    ownTokens: [LDO],
  },
})
