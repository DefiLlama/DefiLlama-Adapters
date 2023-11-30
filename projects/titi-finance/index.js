const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensAndLPsSharedOwners, sumTokens2 } = require('../helper/unwrapLPs')
const { stakings } = require("../helper/staking");

// --------------------------

const ethTiTiToken = "0x3bdffA70f4b4E6985eED50453c7C0D4A15dcEc52";   // TiTi Token
const ethTiTiStaking = "0x5390Dbf4958F21BB317C72744c110977F4c03311";    // TiTi Staking

const eraTiTiToken = "0x4EBfb78C4780C304dff7de518db630b67e3F044b";    // TiTi Token Era
const eraTiTiStaking = "0x1B05972C2e46288201E0432262bd8e925d4fCF94";    // TiTi Staking Era


async function ethTvl() {
    const balances = {};

    const ownerAddresses = [
        "0x49a0c2076DE4801bcadFEf78d0FA63cEC0AD1cB4",    // MAMMSwapPair
    ];
    
    const tokenAddresses = [
        [ADDRESSES.ethereum.USDC, false],    // USDC
    ];
    
    await sumTokensAndLPsSharedOwners(balances, tokenAddresses, ownerAddresses);

    return balances;
}

// zksync era
async function eraTvl(_, _b, _cb, { api }) {
    let balances = {};

    const ownerAddresses = [
        "0xc856175575F6406b59AD6822c3114494990750DC",    // MAMMSwapPair
    ];

    const tokenAddresses = [
        ADDRESSES.era.USDC    // USDC
    ];

    balances = await sumTokens2({ api, tokens: tokenAddresses, owners: ownerAddresses });
    return balances;
}

module.exports = {
    methodology: `Calculate the reserve-type assets locked in the contract, including the user's stake funds in MarketMakerFund and the reserve of TiUSD issued by the protocol, TiTi-AMMs used to provide liquidity TiUSD is not included`,
    ethereum: {
        tvl: ethTvl,
        // staking: stakings([ethTiTiStaking], [ethTiTiToken], 'ethereum')
    },
    era: {
        tvl: eraTvl,
        // staking: stakings([eraTiTiStaking], eraTiTiToken, "era")
    },
}