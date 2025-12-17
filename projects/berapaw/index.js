const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

// tokens addresses
const LBGT_ADDRESS = "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe";
const PBERA_ADDRESS = "0xDeadf18CB9233770FE8874c78D7483b4A126B34a";
const SWBERA_ADDRESS = "0x118D2cEeE9785eaf70C15Cd74CD84c9f8c3EeC9a";
const BGT_ADDRESS = "0x656b95E550C07a9ffe548bd4085c72418Ceb1dba";

// forge addresses
const BERAPAW_FORGE_ADDRESS = "0xFeedb9750d6ac77D2E52e0C9EB8fB79F9de5Cafe";
const BERAPAW_STAKER = "0x4b1d14c4fEA305c4144b51ee64141567A0F0B00B";

// staking vaults
const STAKED_LBGT_VAULT = "0xFace73a169e2CA2934036C8Af9f464b5De9eF0ca";
const STAKED_PBERA_VAULT = "0xE3e61dBb030998110b91c0D1de8215DB761F52c6";

// LP staking
const BERACHAIN_REWARD_VAULT_WBERA_LBGT_LP = "0xE8ED00B1B142E8D84eF773C4FCcaA18682d5a401";
const LP_REWARD_VAULT = "0xa77dee7bc36c463bB3E39804c9C7b13427D712B0";


// counts total supply of LBGT and pBERA tokens
async function tvl(api) {
    // check BGT balance in BeraPaw Forge (LBGT backing)
    await sumTokens2({
        owner: BERAPAW_FORGE_ADDRESS,
        tokens: [BGT_ADDRESS],
        api,
    });
    
    // check BERA, WBERA and swBERA balance in BERAPAW_STAKER (pBERA backing)
    await sumTokens2({
        owner: BERAPAW_STAKER,
        tokens: [
            ADDRESSES.null, // BERA (native token)
            ADDRESSES.berachain.WBERA, // WBERA
            SWBERA_ADDRESS, // swBERA
        ],
        api,
    });
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
        pool2,
    },
};