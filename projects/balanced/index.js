const axios = require("axios");
const sdk = require('@defillama/sdk')
const { get } = require('../helper/http')

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3';
const balancedDexContract = 'cxa0af3165c08318e988cb30993b3048335b94af6c';
const balancedLoansContract = 'cx66d4d90f5f113eba575bf793570135f9b10cece1';
const balancedOracleContract = 'cx133c6015bb29f692b12e71c1792fddf8f7014652';
const stabilityFundContract = 'cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6';

async function icxCall(address, method, params) {
    const response = await axios.post(icxApiEndpoint, {
        jsonrpc: '2.0',
        method: 'icx_call',
        id: 1234,
        params: {
            to: address,
            dataType: 'call',
            data: {
                method: method,
                params: params
            }
        }
    })
    return response.data.result;
}

async function getLoanTvl() {
    const totalCollateral = await icxCall(balancedLoansContract, 'getTotalCollateral');
    const bnUSDinLOOP = await icxCall(balancedOracleContract, 'getLastPriceInLoop', { symbol: 'bnUSD' });
    const collateralTvl = parseInt(totalCollateral, 16) / bnUSDinLOOP;

    return collateralTvl;
}

async function getDexTvl() {
    const balances = {}
    const pools = await get('https://balanced.icon.community/api/v1/pools')
    pools.forEach(({ quote_liquidity, base_liquidity }) => {
        sdk.util.sumSingleBalance(balances, 'tether', base_liquidity)
        sdk.util.sumSingleBalance(balances, 'tether', quote_liquidity)
    })
    return balances
}

async function getStabilityFundTvl() {
    const supportedTokens = await icxCall(stabilityFundContract, 'getAcceptedTokens');
    const balances = await (supportedTokens && Promise.all(supportedTokens.map(async token => {
        const hexBalance = await icxCall(token, 'balanceOf', { _owner: stabilityFundContract });
        const tokenDecimals = await icxCall(token, 'decimals');
        const balance = parseInt(hexBalance, 16) / 10 ** parseInt(tokenDecimals, 16);
        return balance;
    })));

    return balances.reduce((sum, balance) => sum + balance, 0);
}

async function tvl() {
    const [stabilityFundTvl, loanTvl, dexTvl] = await Promise.all([
        getStabilityFundTvl(),
        getLoanTvl(),
        getDexTvl(),
    ])
    sdk.util.sumSingleBalance(dexTvl, 'tether', stabilityFundTvl)
    sdk.util.sumSingleBalance(dexTvl, 'tether', loanTvl)
    return dexTvl
}

module.exports = {
    misrepresentedTokens: true,
    methodology: 'TVL consists of liquidity on the DEX, deposits made to the lending program and the stability fund. Data is pulled from the ICX API "https://ctz.solidwallet.io/api/v3" and Balanced stats API "https://balanced.sudoblock.io/api/v1/docs',
    icon: {
        tvl
    },
};
