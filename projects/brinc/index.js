const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const treasury = "0xB5de3f06aF62D8428a8BF7b4400Ea42aD2E0bc53"

module.exports = {
    hallmarks: [
        [1639440000, "Brinc hack due to private key compromise"],
        [1644019200, "Relaunch on Arbitrum"]
    ],
    methodology: `DAI reserves in the bonding curve `,
    arbitrum: {
        tvl: sumTokensExport({ owners: [treasury], tokens: [ADDRESSES.optimism.DAI], }),
    }
}