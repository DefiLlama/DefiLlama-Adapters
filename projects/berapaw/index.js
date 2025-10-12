const { stakings } = require("../helper/staking");
const ADDRESSES = require("../helper/coreAssets.json");

// tokens addresses
const LBGT_ADDRESS = "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe";
const PBERA_ADDRESS = "0xDeadf18CB9233770FE8874c78D7483b4A126B34a";

// staking vaults
const STAKED_LBGT_VAULT = "0xFace73a169e2CA2934036C8Af9f464b5De9eF0ca";
const STAKED_PBERA_VAULT = "0xE3e61dBb030998110b91c0D1de8215DB761F52c6";

// LP staking
const BERACHAIN_REWARD_VAULT_WBERA_LBGT_LP = "0xE8ED00B1B142E8D84eF773C4FCcaA18682d5a401";
const LP_REWARD_VAULT = "0xa77dee7bc36c463bB3E39804c9C7b13427D712B0";


// counts total supply of LBGT and pBERA tokens
async function tvl(api) {
    const lbgtDeposit = await api.call({
        target: LBGT_ADDRESS,
        abi: 'erc20:totalSupply',
    });
    const pberaDeposit = await api.call({
        target: PBERA_ADDRESS,
        abi: 'erc20:totalSupply',
    });
    // LBGT and pBERA can be redeemed 1:1 for BERA
    api.add(ADDRESSES.null, lbgtDeposit);
    api.add(ADDRESSES.null, pberaDeposit);
}

// counts tokens staked in LBGT and pBERA vaults
function stakingTvl() {
    const stakingContracts = [STAKED_LBGT_VAULT, STAKED_PBERA_VAULT];
    const stakingTokens = [LBGT_ADDRESS, PBERA_ADDRESS];
    
    return stakings(stakingContracts, stakingTokens, "berachain");
}

// counts WBERA-LBGT LP tokens
async function pool2(api) {
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
    methodology: 'TVL includes staked LBGT and pBERA tokens, plus WBERA-LBGT LP tokens',
    berachain: {
        tvl,
        staking: stakingTvl(),
        pool2,
    },
};