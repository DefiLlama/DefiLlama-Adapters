const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// fantom contracts
const controllerFantom = '0xE5365c31c08d6ee44fdd33394ba279b85557c449';
const tresuryFantom = "0x146dd6E8f9076dfEE7bE0b115bb165d62874d110";
const rewardPoolFantom = '0x8E629C4301871d2A07f76366FE421e86855DC690';

// sonic contracts
const controllerSonic = '0x75e1e98650c119c4E3dCE3070CE6A5397Ed70c6a';
const tresurySonic = '0x3bDbd2Ed1A214Ca4ba4421ddD7236ccA3EF088b6';
const rewardPoolSonic = '0xda08F7DE9923acEe24CE292Ec2b20D45b1522Cb6';
const sonicSacra = '0x7AD5935EA295c4E743e4f2f5B4CDA951f41223c2'


module.exports = {
  methodology: `We count the WFTM, wS and sacra on treasury, reward pool and controller contracts`,
  fantom: {
    tvl: sumTokensExport({ token: ADDRESSES.fantom.WFTM, owners: [controllerFantom, tresuryFantom, rewardPoolFantom] })
  },
  sonic: {
    tvl: sumTokensExport({ token: ADDRESSES.sonic.wS, owners: [controllerSonic, tresurySonic, rewardPoolSonic] }),
    staking: sumTokensExport({ token: sonicSacra, owners: [controllerSonic, tresurySonic, rewardPoolSonic] }),
  }
}