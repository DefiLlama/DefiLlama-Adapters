const {abi} = require("./abi");
const {getConfig} = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/main/mainnet/addresses.json";

async function tvlEthereum(_, block, _1, {api}) {
    const config = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);
    return vaultsTvl(api, config.ethereum.vaults);
}

async function tvlArbitrum(_, block, _1, {api}) {
    const config = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);
    return vaultsTvl(api, config.arbitrum.vaults);
}

async function vaultsTvl(api, vaults) {
    if (vaults.length > 0) {
        const vaultAddresses = vaults.map(vault => vault.PlasmaVault);
        const output = await api.multiCall({abi: abi.totalAssets, calls: vaultAddresses})
        output.forEach((totalAssets, i) => {
            api.add(vaults[i].asset, totalAssets)
        });
    }

    return api.getBalances();
}

module.exports = {
    methodology: `Counts the tokens deposited into IPOR Fusion Vaults.`,
    ethereum: {
        tvl: tvlEthereum
    },
    arbitrum: {
        tvl: tvlArbitrum
    },
};
