const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const USDe = ADDRESSES.ethereum.USDe

module.exports = {
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: USDe })
            await sumTokens2({
                api,
                owner: "0x2d4d2a025b10c09bdbd794b4fce4f7ea8c7d7bb4",
                tokens: [
                    ADDRESSES.ethereum.USDC,
                    ADDRESSES.ethereum.sUSDS,
                    "0xC139190F447e929f090Edeb554D95AbB8b18aC1C" // USDtb
                ]
            })
            api.add(USDe, supply - (await api.getBalancesV2().getUSDValue())*1e18)
        },
    }
}
