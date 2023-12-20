const {default: BigNumber} = require('bignumber.js');
const {Program} = require("@project-serum/anchor");
const {getProvider} = require("../helper/solana");

const data = require("./contracts.json");
const poolAbi = require('./abi/pool.json');
const idl = require("./idl/bridge.json");

const POOL_DECIMALS = 3;

const toNumber = (decimals, n) => BigNumber(n / (10 ** decimals)).toFixed(0)

const solanaTvl = async (_, _b, _cb, {api,}) => {
    const provider = getProvider();
    const programId = data['solana'].bridgeAddress;
    const bridge = new Program(idl, programId, provider);

    const tokensData = data['solana'].tokens;
    const tokenAddresses = tokensData.map(t => t.tokenAddress);
    const poolAddresses = tokensData.map((t) => t.poolAddress);

    const pools = await Promise.all(
        poolAddresses.map((poolAddress) =>
            bridge.account.pool.fetch(poolAddress),
        )
    );
    const tvlsPoolDecimals = pools.map((pool) => pool.d.toString());
    const tvls = convertTvlsToTokenPrecision(tvlsPoolDecimals, tokensData)
    api.addTokens(tokenAddresses, tvls);
}

function getTVLFunction(chain) {
    if (chain === 'solana') return solanaTvl;

    return async function evmTvl(timestamp, ethBlock, {[chain]: block}, {api, logArray}) {
        const tokensData = data[chain].tokens;
        const tokenAddresses = tokensData.map(t => t.tokenAddress);
        const poolAddresses = tokensData.map(t => t.poolAddress);

        const [tvlsPoolDecimals] = await Promise.all([
            api.multiCall({abi: poolAbi.tvl, calls: poolAddresses}),
        ])

        const tvls = convertTvlsToTokenPrecision(tvlsPoolDecimals, tokensData);
        api.addTokens(tokenAddresses, tvls);
    };
}

function convertTvlsToTokenPrecision(tvlsPoolDecimals, tokensData) {
    const tvls = [];
    for (let i = 0; i < tvlsPoolDecimals.length; i++) {
        const tvl = tvlsPoolDecimals[i];
        const tokenDecimals = tokensData[i].decimals;
        tvls.push(toNumber(POOL_DECIMALS - tokenDecimals, tvl));
    }
    return tvls;
}

module.exports = {
    methodology: "All tokens locked in Allbridge Core pool contracts.",
    timetravel: false,
}

Object.keys(data).forEach(chain => {
    module.exports[chain] = {
        tvl: getTVLFunction(chain),
    }
})
