const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
    era: { tvl: sumTokensExport({ tokens: [ADDRESSES.era.USDC], owners: ['0x47eAD228547db8397398C1D3aAfd0847CBEbddeC'], }) },
    bsc: { tvl: sumTokensExport({ tokens: [ADDRESSES.bsc.USDC], owners: ['0x25173BB47CB712cFCDFc13ECBebDAd753090801E'], }) },
    arbitrum: { tvl: sumTokensExport({ tokens: [ADDRESSES.arbitrum.USDC], owners: ['0xcDf9eED57Fe8dFaaCeCf40699E5861517143bcC7'], }) },
};
