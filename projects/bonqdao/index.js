const sdk = require('@defillama/sdk');
const { stakings } = require("../helper/staking");
const TROVE_FACTORY_CONTRACT = '0x3bB7fFD08f46620beA3a9Ae7F096cF2b213768B3'
const ALBT = '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0' // Ethereum version of AllianceBlock Token
const BEUR = '0x338Eb4d394a4327E5dB80d08628fa56EA2FD4B81' // BEUR Token pegged to the Euro
const BNQ = '0x91eFbe97e08D0ffC7d31381c032D05FAd8E25aAA' // BONQ Utility Token
const BNQ_STAKING_CONTRACT = '0xb1b72B3579b03dFdCfF3195486277605e55Cf703'
const BNQ_BEUR_UNIV3_POOL = '0xA96373C7a591fd21b86E0c9b8E156CC81E6cBb5e'
const TOKEN_COLLATERAL = [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
    '0x35b2ece5b1ed6a7a99b83508f8ceeab8661e0632', // WALBT (Wrapped AllianceBlock Token)
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
]
const LP_COLLATERAL = [
    '0xa1dd21527c76bb1a3b667149e741a8b0f445fae2', // Arrakis Vault V1 BEUR/DAI
    '0x388e289a1705fa7b8808ab13f0e0f865e2ff94ee'  // Arrakis Vault V1 USDC/BEUR
]
const BEUR_DAI_POOL = [
    BEUR,                                         // token 0 = BEUR
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'  // token 1 = DAI
]
const USDC_BEUR_POOL = [
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // token 0 = USDC
    BEUR                                          // token 1 = BEUR
]

async function getPairTVL(balances, contract, pair, api) {
    // Get quantity of underlying tokens in Arrakis vault
    const underlying = await api.call({
        abi: 'function getUnderlyingBalances() public view returns (uint256 amount0Current, uint256 amount1Current)',
        target: contract,
    });
    underlying.forEach((e, index) => {
        return sdk.util.sumSingleBalance(balances, pair[index], e, api.chain);
    })
}

async function tvl(_, _1, _2, { api }) {
    const balances = {};

    const tokenUnderlying = await api.multiCall({
        calls: TOKEN_COLLATERAL.map(token => ({
            target: TROVE_FACTORY_CONTRACT,
            params: [token]
        })),
        abi: 'function totalCollateral(address _token) external view returns (uint256)',
        chain: 'polygon'
    });
    tokenUnderlying.forEach((e, index) => {
        // use ALBT price from Ethereum, WALBT not available on Coingecko
        if (TOKEN_COLLATERAL[index] === '0x35b2ece5b1ed6a7a99b83508f8ceeab8661e0632') {
            return sdk.util.sumSingleBalance(balances, ALBT, e);
        }
        return sdk.util.sumSingleBalance(balances, TOKEN_COLLATERAL[index], e, api.chain);

    })

    await getPairTVL(balances, LP_COLLATERAL[0], BEUR_DAI_POOL, api)
    await getPairTVL(balances, LP_COLLATERAL[1], USDC_BEUR_POOL, api)

    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Summation of the collateral deposited in BonqDAO Troves (personal lending vaults)',
    start: 36884903,
    polygon: {
        tvl,
        staking: stakings([BNQ_STAKING_CONTRACT], BNQ),
        pool2: stakings([BNQ_BEUR_UNIV3_POOL], [BEUR, BNQ])
    }
};


    // Save code for future reference

    // Get quantity of RAKIS tokens deposited in Troves as collateral
    // const arrakisTokens = await api.multiCall({
    //     calls: LP_COLLATERAL.map(token => ({
    //         target: TROVE_FACTORY_CONTRACT,
    //         params: [token]
    //     })),
    //     abi: 'function totalCollateral(address _token) external view returns (uint256)',
    //     chain: 'polygon'
    // });
    // Get totalsupply of RAKIS tokens for the specific Arrakis vault
    // const totalSupply = await api.multiCall({
    //     calls: LP_COLLATERAL.map(vault => ({
    //         target: vault,
    //     })),
    //     abi: 'function totalSupply() public view returns (uint256)',
    //     chain: 'polygon'
    // });
    // await getPairTVL(balances, LP_COLLATERAL[0], BEUR_DAI_POOL, arrakisTokens[0] / totalSupply[0], api)
    // await getPairTVL(balances, LP_COLLATERAL[1], USDC_BEUR_POOL, arrakisTokens[1] / totalSupply[1], api)