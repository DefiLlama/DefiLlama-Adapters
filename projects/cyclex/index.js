const { symbol, decimals } = require('@defillama/sdk/build/erc20');
const { get } = require('../helper/http')


async function fetch() {

    const CYCLEX_API_ALL_FUND = 'https://cyclex.cc/api/fundProduct'

    const CAFM = {
        address: '0x58985dDEda88032e9ABEad5A67d95Ba1e4F60345',
        name: 'CycleX AILayer Tokenized Fund(M)',
        symbol: 'CAFM',
        decimals: 18
    }

    const CAFR = {
        address: '0x4c717e5B5B622E5C9F22039eB46762B7AEa9663E',
        name: 'CycleX AILayer Tokenized Fund(R)',
        symbol: 'CAFR',
        decimals: 18
    }
    
    // const CAFMSymbol = await api.call({abi: 'erc20:symbol', target: CAFM})
    // const CAFMSupply = await api.call({abi: 'erc20:totalSupply', target: CAFM})
    // const CAFMDecimals = await api.call({abi: 'erc20:decimals', target: CAFM})
    // CycleX AILayer Tokenized Fund(R):
    // const CAFR = '0x4c717e5B5B622E5C9F22039eB46762B7AEa9663E'

    try {
        const response = await get(CYCLEX_API_ALL_FUND);
        // console.log(`API Response data: ${JSON.stringify(response.data)}`);
        const allFund = response.data
        const symbols = [CAFM.symbol, CAFR.symbol];
        const funds = allFund.find(item => symbols.includes(item.simple_name));
        if (funds === undefined || funds === null) {
            return 0;
        }
        
        const totalTVL = funds.reduce((acc, fund) => acc + (fund.tvl_value * 1e5), 0);
        return totalTVL;
    } catch (error) {
        console.error(`Error fetching TVL: ${error.message}`);
        if (error.response) {
            console.error(`Error response data: ${JSON.stringify(error.response.data)}`);
        }
        return 0;
    }
}

module.exports = {
    methodology: "TVL is fetched from CycleX API and includes price data",
    ailayer: {
        fetch
    },
    fetch
}
