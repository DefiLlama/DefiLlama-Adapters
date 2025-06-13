const yoVaultsBase = [
    '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
    '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
    '0x0000000f2eB9f69274678c76222B35eEc7588a65'
];

async function tvlBase(api) {
    return api.erc4626Sum2({
        calls: yoVaultsBase
    });
}


module.exports = {
    methodology: "We calculate TVL based on the Total Supply of our proxy contracts through which users interact with vault's contracts",
    base: {
        tvl: tvlBase
    },
};