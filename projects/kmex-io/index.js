const { gmxExports } = require('../helper/gmx')
const { sumTokensExport } = require("../helper/unknownTokens")

// Kava
const kmexVault = '0x15B29830D5bE7240c7a401fe0B0dA5086C9d84c5';
const kmexStaking = '0x71dDDafFb0DB6BEDc9495Ef92c5700ec96527BFb'; // Staked KMX, sKMX
const kavaKMX = '0x599b05875866ceB7378452D9F432d5377825F44B';
const kavaKMXKAVAPool = '0xA08848E7A4dbaEeE8eeAb93a05F437ed9Efa2162'

module.exports = {
  kava: {
    staking: sumTokensExport({ owner: kmexStaking, tokens: [kavaKMX],lps: [kavaKMXKAVAPool], useDefaultCoreAssets: true, }),
    tvl: gmxExports({ vault: kmexVault, })
  },
};
