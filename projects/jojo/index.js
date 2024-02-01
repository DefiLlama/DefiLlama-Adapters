const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
    era: { tvl: sumTokensExport({ tokens: [ADDRESSES.era.USDC], owners: ['0x47eAD228547db8397398C1D3aAfd0847CBEbddeC'], }) },
    bsc: { tvl: sumTokensExport({ tokens: [ADDRESSES.bsc.USDC], owners: ['0x25173BB47CB712cFCDFc13ECBebDAd753090801E'], }) },
    arbitrum: { tvl: sumTokensExport(
        {tokens: [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.WBTC, 
                ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.GMX, ADDRESSES.arbitrum.WSTETH, '0x539bde0d7dbd336b79148aa742883198bbf60342'], 
            owners: ['0xcDf9eED57Fe8dFaaCeCf40699E5861517143bcC7','0x747282eadcd331e3a8725DcD9e358514D723b3a3']}
        ) },
};
