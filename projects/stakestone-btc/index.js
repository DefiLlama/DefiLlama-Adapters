const ADDRESSES = require('../helper/coreAssets.json')

const vaultABI = {
    "getDepositAmounts": "function getDepositAmounts() view returns (address[], uint256[])"
}

const VaultBSC = '0xc6f830BB162e6CFb7b4Bac242B0E43cF1984c853';

const bscTvl = async (api) => {
    const btclist = await api.call({ abi: vaultABI.getDepositAmounts, target: VaultBSC })
    api.add(ADDRESSES.bsc.BTCB, btclist[1][0] / 10**18)
    return api.sumTokens({ owner: VaultBSC, tokens: [ADDRESSES.bsc.BTCB] })
}


module.exports = {
    start: 42326440,
    bsc: {
        tvl: bscTvl,
    }
}
