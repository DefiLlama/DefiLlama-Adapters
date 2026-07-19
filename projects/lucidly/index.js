const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");
const { chainTvl } = require("../helper/boringVault");

const boringVaultsV0Ethereum = [
    {
        name: "Stable Yield USD",
        vault: "0x279CAD277447965AF3d24a78197aad1B02a2c589",
        accountant: "0x03D9a9cE13D16C7cFCE564f41bd7E85E5cde8Da6",
        teller: "0xaefc11908fF97c335D16bdf9F2Bf720817423825",
        lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
        startBlock: 22555405,
        baseAsset: ADDRESSES.ethereum.USDC,
    },
];

const boringVaultsV0Arbitrum = [
    {
        name: "Stable Yield USD",
        vault: "0x279CAD277447965AF3d24a78197aad1B02a2c589",
        accountant: "0x03D9a9cE13D16C7cFCE564f41bd7E85E5cde8Da6",
        teller: "0xaefc11908fF97c335D16bdf9F2Bf720817423825",
        lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
        startBlock: 335361063,
        baseAsset: ADDRESSES.arbitrum.USDC,
    },
];

const boringVaultsV0Base = [
    {
        name: "Stable Yield USD",
        vault: "0x279CAD277447965AF3d24a78197aad1B02a2c589",
        accountant: "0x03D9a9cE13D16C7cFCE564f41bd7E85E5cde8Da6",
        teller: "0xaefc11908fF97c335D16bdf9F2Bf720817423825",
        lens: "0x074F543E7DaA7C67F77bfD8C41C79127c4dd80d9",
        startBlock: 30004947,
        baseAsset: ADDRESSES.base.USDC,
    },
];

async function legacyTvl(api) {
    const registryAddress = '0x3C2A24c9296eC8B1fdb8039C937DaC7CBca3976c';
    const pools = await api.call({
        abi: 'function getPoolAddresses() view returns (address[])',
        target: registryAddress,
    });

    const tokens = await api.fetchList({ lengthAbi: 'numTokens', itemAbi: 'tokens', calls: pools, groupedByInput: true, })
    const ownerTokens = pools.map((v, i) => [tokens[i], v]);
    const balances = await api.sumTokens({ ownerTokens });
    const numericBalances = {};
    for (const [token, amount] of Object.entries(balances)) {
        numericBalances[token] = Number(amount);
    }
    return numericBalances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    start: 1710745200,
    doublecounted: true,
    ["ethereum"]: {
        tvl: sdk.util.sumChainTvls([
            (api) => chainTvl(api, boringVaultsV0Ethereum),
            (api) => legacyTvl(api)
        ])
    },
    ["arbitrum"]: { tvl: (api) => chainTvl(api, boringVaultsV0Arbitrum) },
    ["base"]: { tvl: (api) => chainTvl(api, boringVaultsV0Base) },
};
