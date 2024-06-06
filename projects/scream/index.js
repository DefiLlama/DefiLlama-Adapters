const ADDRESSES = require('../helper/coreAssets.json')
const { getCompoundV2Tvl } = require('../helper/compound')
const { staking } = require('../helper/staking')

function lending(borrowed) {
    return async (...params) => {
        const transformAdress = i => `fantom:${i}`
        const balances = await getCompoundV2Tvl("0x260e596dabe3afc463e75b6cc05d8c46acacfb09", "fantom", addr => {
            if (addr === "0xAd84341756Bf337f5a0164515b1f6F993D194E1f") {
                return ADDRESSES.ethereum.TUSD
            }
            return transformAdress(addr)
        }, undefined, undefined, borrowed)(...params)
        return Object.fromEntries(Object.entries(balances).filter(b => Number(b[1]) > 1))
    }
}

module.exports = {
    hallmarks: [
        [1652572800,"DEI depeg"]
    ],
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets. fUSD is returned as TUSD",
            fantom: {
        staking: staking("0xe3d17c7e840ec140a7a51aca351a482231760824", "0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475"),
        tvl: lending(false),
        borrowed: lending(true),
    }
}
