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
        //staking: stakingPricedLP("0xE5Df6583eE8DAe9F532e65D7D2C30A961c442f8a", "0x5fE5E1d5D86BDD4a7D84B4cAfac1E599c180488f", "ethereum", "0xe4f157c7ca54f435fcc3bb0b4452f98d3a48f303", "dai", true )
    }
}