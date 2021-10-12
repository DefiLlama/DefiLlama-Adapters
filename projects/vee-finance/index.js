const {getCompoundV2Tvl} = require('../helper/compound')
const sdk = require('@defillama/sdk')

module.exports={
    methodology: 'As in Compound Finance, TVL counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.',
    tvl: sdk.util.sumChainTvls([
        getCompoundV2Tvl("0xA67DFeD73025b0d61F2515c531dd8D25D4Cfd0Db", "avax", addr=>`avax:${addr}`),
        getCompoundV2Tvl("0x43AAd7d8Bc661dfA70120865239529ED92Faa054", "avax", addr=>`avax:${addr}`, "0x6481490DBb6Bd0e8b7CB7E1317470f6d08aDa5A2", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"),
    ])
}
