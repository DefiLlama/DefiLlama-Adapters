const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');

const SGREEN_CONTRACT = '0xaa0f13488ce069a7b5a099457c753a7cfbe04d36'
const GREEN_CONTRACT = '0xd1Eac76497D06Cf15475A5e3984D5bC03de7C707'
const GREEN_LP_CONTRACT = '0xd6c283655b42fa0eb2685f7ab819784f071459dc'
const RIPE_CONTRACT = '0x2A0a59d6B975828e781EcaC125dBA40d7ee5dDC0'
const RIPE_GREEN_LP_CONTRACT = '0x2aEf3eE3Eb64B7EC0B4ef57BB7E004747FE87eFc'
const RIPE_WETH_LP_CONTRACT = '0x765824aD2eD0ECB70ECc25B0Cf285832b335d6A9'
const ENDAOMENT_CONTRACT = '0x14F4f1CD5F4197DB7cB536B282fe6c59eACfE40d'
const RIPE_GOV_CONTRACT = '0xe42b3dC546527EB70D741B185Dc57226cA01839D'

async function getPairs() {
    const response = await getConfig('ripe', 'https://api.ripe.finance/api/ripe/assets');
    const stabilityPoolAddress = response.result.find(a => a.vaultId === 1).vaultAddress
    const nonSpAssets = response.result.filter(a => a.vaultId > 2)

    // Build token-owner pairs for sumTokens2
    const tokensAndOwners = [];

    for (const { tokenAddress, vaultAddress } of nonSpAssets) {
        tokensAndOwners.push([tokenAddress, vaultAddress]);
        tokensAndOwners.push([tokenAddress, stabilityPoolAddress]);
    }

    return tokensAndOwners;
}

async function tvl(api) {
    const tokensAndOwners = await getPairs();

    return sumTokens2({
        api,
        tokensAndOwners,
        blackListedTokens: [SGREEN_CONTRACT, GREEN_CONTRACT, GREEN_LP_CONTRACT],
    });
}

async function staking(api) {
    const ripeStaked = await api.call({
        abi: 'erc20:balanceOf',
        target: RIPE_CONTRACT,
        params: [RIPE_GOV_CONTRACT]
    })
    api.add(RIPE_CONTRACT, ripeStaked)
}

async function pool2(api) {
    return sumTokens2({
        api,
        tokensAndOwners: [
            [RIPE_WETH_LP_CONTRACT, RIPE_GOV_CONTRACT],
            [RIPE_GREEN_LP_CONTRACT, ENDAOMENT_CONTRACT],
        ],
        resolveLP: true,
    });
}

module.exports = {
    methodology: 'Counts underlying collateral in Ripe vaults, unwrapping yield-bearing tokens to avoid double counting',
    start: 1754006400,
    base: {
        tvl,
        pool2,
        staking
    }
};