const sdk = require('@defillama/sdk');

const VAULT = "0x4Be03f781C497A489E3cB0287833452cA9B9E80B";

async function updateBalancerV2Tvl(api, pluginAddress, _balances) {
    const balancerToken = await api.call({
        abi: 'function getToken() view returns (address)',
        target: pluginAddress
    });

    const assetTokens = await api.call({
        abi: 'function getAssetTokens() view returns (address[])',
        target: pluginAddress
    });
    const totalSupply = await api.call({
        abi: 'function totalSupply() view returns (uint256)',
        target: pluginAddress
    });

    const token0Address = assetTokens[0];
    const token1Address = assetTokens[1];

    const decimals0 = await api.call({
        abi: 'erc20:decimals',
        target: token0Address
    });
    const decimals1 = await api.call({
        abi: 'erc20:decimals',
        target: token1Address
    });

    const poolId = await api.call({
        abi: 'function getPoolId() view returns (bytes32)',
        target: balancerToken
    });
    const poolTotalSupply = await api.call({
        abi: 'function getActualSupply() view returns (uint256)',
        target: balancerToken
    });

    const formattedPoolTotalSupply = poolTotalSupply / 1e18;
    const formattedPluginTotalSupply = totalSupply / 1e18;

    const ratio = formattedPoolTotalSupply === 0 ? 0 : formattedPluginTotalSupply / formattedPoolTotalSupply;

    const [tokens, balances] = await api.call({
        abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[], uint256)',
        target: VAULT,
        params: poolId
    });

    let reserve0 = 0;
    let reserve1 = 0;

    tokens.forEach((token, i) => {
        if (token.toLowerCase() === token0Address.toLowerCase()) {
            reserve0 = balances[i];
        }
        if (token.toLowerCase() === token1Address.toLowerCase()) {
            reserve1 = balances[i];
        }
    });

    const reserve0Beradrome = (reserve0 / (10 ** decimals0)) * ratio;
    const reserve1Beradrome = (reserve1 / (10 ** decimals1)) * ratio;

    const reserve0BeradromeScaled = BigInt(Math.round(reserve0Beradrome * 10 ** decimals0));
    const reserve1BeradromeScaled = BigInt(Math.round(reserve1Beradrome * 10 ** decimals1));

    sdk.util.sumSingleBalance(_balances, token0Address, reserve0BeradromeScaled, api.chain);
    sdk.util.sumSingleBalance(_balances, token1Address, reserve1BeradromeScaled, api.chain);
}

module.exports = {
    updateBalancerV2Tvl
};
