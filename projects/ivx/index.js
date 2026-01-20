const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const ivxVault = "0x598eE20d8D372665a96AFba9d3B0Bfd817f1f340"

module.exports = {
    berachain: {
        tvl: staking(
            [
                ivxVault
            ],
            [
                ADDRESSES.berachain.HONEY,
                ADDRESSES.berachain.WETH,
                ADDRESSES.berachain.WBERA,
                ADDRESSES.berachain.WBTC,
            ])
    },
}