const sdk = require('@defillama/sdk');
const { transformOptimismAddress } = require('../helper/portedTokens');
const perpV2VaultABI = require('./abis/perpV2Vault.json');
const PERP_LEMMA_WETH = '0x29b159aE784Accfa7Fb9c7ba1De272bad75f5674';
const PERP_LEMMA_WBTC = '0xe161C6c9F2fC74AC97300e6f00648284d83cBd19';
const WBTC = "0x68f180fcce6836688e9084f035309e29bf0a2095";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";
const PERP_V2_VAULT = "0xAD7b4C162707E0B2b5f6fdDbD3f8538A5fbA0d60";

//tracks only tvl on optimism (v2) as v1 (on arbitrum) is getting deprecated
async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformOptimismAddress();

    //WBTC is a tail asset meaning we can't deposit it in the vault
    const wbtcBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'optimism',
        target: WBTC,
        params: [PERP_LEMMA_WBTC],
        block: chainBlocks['optimism'],
    })).output;

    sdk.util.sumSingleBalance(balances, transform(WBTC), wbtcBalance);

    const usdcBalancePerpLemmaWBTC = (await sdk.api.abi.call({
        abi: perpV2VaultABI["getBalanceByToken"],
        chain: 'optimism',
        target: PERP_V2_VAULT,
        params: [PERP_LEMMA_WBTC, USDC],
        block: chainBlocks['optimism'],
    })).output;

    sdk.util.sumSingleBalance(balances, transform(USDC), usdcBalancePerpLemmaWBTC);


    //WETH is an accepted collateral meaning we would have to get the balance of it from perpV2Vault
    const wethBalance = (await sdk.api.abi.call({
        abi: perpV2VaultABI["getBalanceByToken"],
        chain: 'optimism',
        target: PERP_V2_VAULT,
        params: [PERP_LEMMA_WETH, WETH],
        block: chainBlocks['optimism'],
    })).output;

    sdk.util.sumSingleBalance(balances, transform(WETH), wethBalance);

    const usdcBalancePerpLemmaWETH = (await sdk.api.abi.call({
        abi: perpV2VaultABI["getBalanceByToken"],
        chain: 'optimism',
        target: PERP_V2_VAULT,
        params: [PERP_LEMMA_WETH, USDC],
        block: chainBlocks['optimism'],
    })).output;

    sdk.util.sumSingleBalance(balances, transform(USDC), usdcBalancePerpLemmaWETH);

    return balances;
}

module.exports = {
    optimism: {
        tvl: tvl,
    }
}; 