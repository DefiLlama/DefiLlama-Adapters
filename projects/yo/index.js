const yoVaultsBase = [
    '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
    '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
    '0x0000000f2eB9f69274678c76222B35eEc7588a65',
    '0x50c749aE210D3977ADC824AE11F3c7fd10c871e9'
];

const yoVaultsEthereum = [
    '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
    '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
    '0x0000000f2eB9f69274678c76222B35eEc7588a65',
    '0x50c749aE210D3977ADC824AE11F3c7fd10c871e9',
    '0x586675A3a46B008d8408933cf42d8ff6c9CC61a1'
];

const yoVaultsArbitrum = [
    '0x0000000f2eB9f69274678c76222B35eEc7588a65'
]

async function tvlBase(api) {
    return api.erc4626Sum2({
        calls: yoVaultsBase
    });
}

async function tvlEthereum(api) {
    return api.erc4626Sum2({
        calls: yoVaultsEthereum
    });
}

async function tvlArbitrum(api) {
    return api.erc4626Sum2({
        calls: yoVaultsArbitrum
    });
}

module.exports = {
    methodology: "We calculate TVL based on the Total Assets of each vault contract on each chain where users deposit into YO vaults",
    base: {
        tvl: tvlBase
    },
    ethereum: {
        tvl: tvlEthereum
    },
    arbitrum: {
        tvl: tvlArbitrum
    }
};