const sdk = require('@defillama/sdk');

const INDEX_TOKEN_CONTRACT = '0x26b694a5A82061246a3fC672716dE01Eb474F09D'
const USDC_TOKEN_CONTRACT = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'

async function tvl(_, _1, _2, { api }) {
    const balances = {};
    equityValuation = await api.call({
        abi: "uint256:equityValuation",
        target: INDEX_TOKEN_CONTRACT,
    })
    await sdk.util.sumSingleBalance(balances, USDC_TOKEN_CONTRACT, equityValuation / 100, api.chain)
    return balances;
  }
  
  module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'TVL in brokkr indexes',
    start: 1000235,
    avax: {
      tvl,
    }
  }; 