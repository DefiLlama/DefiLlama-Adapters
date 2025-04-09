const STAKED_LBGT_VAULT = "0xFace73a169e2CA2934036C8Af9f464b5De9eF0ca";

async function tvl(api) {
    const deposits = await api.call({
        target: STAKED_LBGT_VAULT,
        abi: 'uint256:totalAssets',
    });
    const lbgtAddress = await api.call({
        target: STAKED_LBGT_VAULT,
        abi: 'address:asset',
    });
    api.add(lbgtAddress, deposits);
}
module.exports = {
    berachain: {
        tvl,
    },
};