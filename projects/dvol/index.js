const sdk = require('@defillama/sdk')

const vaults = [
    '0x54781C6aa884297369A55A79eF7Fd1FD7B3bBD32',
    '0x6652f1B0531C4C75B523e74BCf5D0CD009b7BBB8'
]

const abi = {
    "existingVaultAmount": "uint256:existingVaultAmount",
    "existingVaultIds": "function existingVaultIds(uint256 index) view returns (uint256)",
    "idVaultInfoMap": "function idVaultInfoMap(uint256 id) view returns (uint256 id, address depositToken, uint256 maxVaultCapacity, uint256 minVaultLimit, uint256 saleStartTime, uint256 saleEndTime, uint256 termStartTime, uint256 termEndTime, address organization, address transferSigner)",
    "idVaultStateMap": "function idVaultStateMap(uint256 id) view returns (address lpTokenContract, uint256 soldAmount, bool hasTransferred, bool hasSettled)"
}


const vaultsTvl = async (timestamp, block, _, { api }) => {
    const tokens = []
    const bals = []
    const balances = {}

    for(var i = 0; i < vaults.length; i++){
        let vault = vaults[i];
        const ids = []
        const total = await api.call({ target: vault, abi: abi["existingVaultAmount"] });
        for(var j = 0; j < Number(total); j++) {
            ids.push(
                await api.call({
                    target: vault,
                        abi: abi["existingVaultIds"],
                        params: j
                })
            )
        }

        for(i = 0; i < Number(ids.length); i++) {
            tokens.push(
                (await api.call({
                    target: vault,
                    abi: abi["idVaultInfoMap"],
                    params: ids[i]
                })).depositToken
            )
        }

        for(i = 0; i < Number(ids.length); i++) {
            bals.push(
                (await api.call({
                    target: vault,
                    abi: abi["idVaultStateMap"],
                    params: ids[i]
                })).soldAmount
            )
        }
    }

    tokens.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, bals[i], api.chain))

    return balances
}

module.exports = {
    start: 33674950,
    bsc: {
        tvl: vaultsTvl
    },
}
