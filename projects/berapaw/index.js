const STAKED_LBGT_VAULT = "0xFace73a169e2CA2934036C8Af9f464b5De9eF0ca";
const BERACHAIN_REWARD_VAULT_WBERA_LBGT_LP = "0xE8ED00B1B142E8D84eF773C4FCcaA18682d5a401";
const LP_REWARD_VAULT = "0xa77dee7bc36c463bB3E39804c9C7b13427D712B0";

async function tvl(api) {
    //stLBGT Vault TVL
    const deposits = await api.call({
        target: STAKED_LBGT_VAULT,
        abi: 'uint256:totalAssets',
    });
    const lbgtAddress = await api.call({
        target: STAKED_LBGT_VAULT,
        abi: 'address:asset',
    });
    api.add(lbgtAddress, deposits);

    // WBERA-LBGT LP TVL
    const stakedLP = await api.call({
        target: BERACHAIN_REWARD_VAULT_WBERA_LBGT_LP,
        abi: 'erc20:balanceOf',
        params: [LP_REWARD_VAULT],
    });
    const lpAddress = await api.call({
        target: BERACHAIN_REWARD_VAULT_WBERA_LBGT_LP,
        abi: 'address:stakeToken',
    });
    api.add(lpAddress, stakedLP);
}
module.exports = {
    methodology: 'TVL includes staked LBGT and WBERA-LBGT LP tokens',
    berachain: {
        tvl,
    },
};