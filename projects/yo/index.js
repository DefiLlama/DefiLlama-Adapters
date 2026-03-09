const vaults = {
    base: [
        '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
        '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
        '0x0000000f2eB9f69274678c76222B35eEc7588a65',
        '0x50c749aE210D3977ADC824AE11F3c7fd10c871e9'
    ],
    ethereum: [
        '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
        '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
        '0x0000000f2eB9f69274678c76222B35eEc7588a65',
        '0x50c749aE210D3977ADC824AE11F3c7fd10c871e9',
        '0x586675A3a46B008d8408933cf42d8ff6c9CC61a1'
    ],
    arbitrum: [
        '0x0000000f2eB9f69274678c76222B35eEc7588a65'
    ]
}

async function tvl(api) {
    return api.erc4626Sum2({
        calls: vaults[api.chain],
    });
}

module.exports = {
    methodology: "We calculate TVL based on the Total Assets of each vault contract on each chain where users can deposit into YO vaults",
    doublecounted: true,
    base: { tvl },
    ethereum: { tvl },
    arbitrum: { tvl },
};