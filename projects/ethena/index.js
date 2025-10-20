const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const USDe = ADDRESSES.ethereum.USDe

module.exports = {
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: USDe })
            await sumTokens2({
                api,
                owners: [
                    "0x2d4d2a025b10c09bdbd794b4fce4f7ea8c7d7bb4",
                    "0xd54F23BE482D9A58676590fCa79c8E43087f92fB",
                    "0x2B5AB59163a6e93b4486f6055D33CA4a115Dd4D5"
                ],
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
