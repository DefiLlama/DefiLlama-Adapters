const { sumERC4626VaultsExport } = require('../helper/erc4626');

module.exports = {
    methodology: 'Counts total value of assets staked into the Upshift Tori ecosystem vault.',
    doublecounted: true,
    ethereum: { tvl: sumERC4626VaultsExport({vaults: ['0xcd69123b3FBBfC666E1f6a501da27B564C00De54'], tokenAbi: 'address:asset', balanceAbi: 'uint:getTotalAssets'}) }
}