const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
    const balETHSymbioticVault = await api.call({
        abi: "uint256:totalAssets",
        target: '0x0D53bc2BA508dFdf47084d511F13Bb2eb3f8317B',
    });

    api.add(ADDRESSES.ethereum.WSTETH, balETHSymbioticVault)


    const balETHEigenLayerVault = await api.call({
        abi: "uint256:totalAssets",
        target: '0x47657094e3AF11c47d5eF4D3598A1536B394EEc4',
    });

    api.add(ADDRESSES.ethereum.WSTETH, balETHEigenLayerVault)
}

module.exports = {
    doublecounted: true,
    ethereum: {
        tvl,
    },
};
