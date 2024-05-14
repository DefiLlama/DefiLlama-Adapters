const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')


//Canto
const cantoVault = '0xbB975222F04C1992A39A27b19261646FD6547919';
const cantoStaking = '0x05FA19c543aAA066EC7F67526b1c0a4fa3b9fEEE';
const cantoCAD = "0x8F20150205165C31D9b29C55a7B01F4911396306"

module.exports = {
  canto: {
    staking: staking(cantoStaking, cantoCAD),
    tvl: gmxExports({ vault: cantoVault })
  },
  hallmarks:[
    [1709142570, "Cadence Perpetuals Launch"]
  ],
  
};