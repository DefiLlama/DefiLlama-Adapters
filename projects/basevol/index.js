const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const clearingHouse = '0xa57c9bD31d58b487A2934A4b74C00BA7Ae89646C';
const gVault = [
    '0xf1BE2622fd0f34d520Ab31019A4ad054a2c4B1e0',
    '0xd3cDA3ec2DE563DB4c169efc0b8B1786aa53E2AD',
    '0x61b596A14ae170A4304266B1a17b3273D9aFc08C',
    '0xeb1929190c8decb97fb0744a818a3c4d9d2d0455'
];
const highVolVault = [
    '0x052E7d7FBb4Cf3BE81a4fFC182BcC0FD802417Ae',
    '0xA68552cF110FD594BCbcbd9C00BdcB522D1B64b4',
    '0x47B72772c86C67ef9644Eb21b0531678aC886E72',
    '0xD4f48d5c48a688404452E07e1959609aF2d0337f'
];
const over99Vault = [
    '0xe34E510B1ef2e97911a646F120bD0dA2CA4ac0ff',
    '0x8367B9fb96f62c8a2eEA7dDd59AB52fd9289274C',
    '0x31C87265f42Eb7F49ad3F32B86Ceb252ab2f7DeA',
    '0x3f45Cead0C6d79fDce3B17682b945F804F3C88Fe'
];
const under101Vault = [
    '0x82b394c5d4eaC1b9755Eb33bF70AD6D08B2d59f4',
    '0x0033AC4970eE02a5085Cfe4801cB28438b9F8735',
    '0xe912575a6d93ed0cEc00f8966B6F8366e603CdB8',
    '0x618b71409E5e2A453749E3e8664cB38DE395EDd4'
];

const sparkUSDC = '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A'
const steakhouseUSDCV2 = '0xbeef0e0834849aCC03f0089F01f4F1Eeb06873C9'

module.exports = {
    methodology: `Counts the USDC amount held in the ClearingHouse and Vault contracts.`,
    base: {
        tvl: sumTokensExport({ 
          owners: [ clearingHouse, ...gVault, ...highVolVault, ...over99Vault, ...under101Vault],
          tokens: [ ADDRESSES.base.USDC, sparkUSDC, steakhouseUSDCV2 ],
        }),
    }
};

