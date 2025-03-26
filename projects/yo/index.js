const yoVaultsBase = [
    '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
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