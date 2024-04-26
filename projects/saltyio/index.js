const abi = require("./abi.json");


const POOLS_CONFIG_CONTRACT = '0xA6ba8decE812f4663A19960735c0F66560a1D894';
const POOLS_CONTRACT = '0xf5D65d370141f1fff0Db646c9406Ce051354A8a5';
const SALT_CONTRACT = '0x0110B0c3391584Ba24Dbf8017Bf462e9f78A6d9F';
const STAKING_CONTRACT = '0x7c6f5E73210080b093E724fbdB3EF7bcdd6D468b';
const DAO_CONTRACT = '0x35fdBd5b52D131629EA5403FF1bc7ff6A1869D60';

const seenTokens = new Set();


async function handleToken(token, {api} )
    {
    if ( ! seenTokens.has(token) )
        {
        const balance = await api.call({
            abi: abi.balanceOf,
            target: token,
            params: POOLS_CONTRACT });

        if ( ! seenTokens.has(token) ) // prevents race condition issues
            api.add(token, balance)

        seenTokens.add(token);
        }
    }


async function tvl(_, _1, _2, { api }) 
    {
    const poolIDs = await api.call({
        abi: abi.whitelistedPools,
        target: POOLS_CONFIG_CONTRACT,
        params: [] });


    for (var i = 0; i < poolIDs.length; i++) 
        {
        const underlyingTokens = await api.call({
            abi: abi.underlyingTokenPair,
            target: POOLS_CONFIG_CONTRACT,
            params: poolIDs[i] });

        handleToken( underlyingTokens[0], api );
        handleToken( underlyingTokens[1], api );
        }
    }


async function treasury(_, _1, _2, { api }) 
    {
    const balance = await api.call({
        abi: abi.balanceOf,
        target: SALT_CONTRACT,
        params: DAO_CONTRACT });

    api.add(SALT_CONTRACT, balance)
    }


async function staking(_, _1, _2, { api }) 
    {
    const balance = await api.call({
        abi: abi.balanceOf,
        target: SALT_CONTRACT,
        params: STAKING_CONTRACT });

    api.add(SALT_CONTRACT, balance)
    }


module.exports = 
    {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Calculates TVL and Staking metrics using the Salty.IO contracts.',
    start: 1713700739,
    ethereum: 
        {
        tvl: tvl,
        staking: staking,
        treasury: treasury
        }
    }; 