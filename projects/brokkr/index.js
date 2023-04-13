const sdk = require('@defillama/sdk');
const INDEX_TOKEN_CONTRACT = {'avax': '0xB0E2880D4429d10eF1956062B260aDf09557A1da'}
const USDC_TOKEN_CONTRACT = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
const CALM_PORTFOLIO_CONTRACT = '0x2eAf73F8E6BCf606f56E5cf201756C1f0565C068'
const AMBITIOUS_PORTFOLIO_CONTRACT = '0x0294D02e9Fee4872e72697e9514aD0be671DB498'
const DCA_PORTFOLIO_CONTRACTS = {'avax': [
    "0xBbE9f28182163e767AA17072eDbeccD19DE12AE3",
    "0xF96Df0DB82Ebec3F5e8043C26522608f09c68600",
    "0x6e25e57B0Dc35eFe3688c2850568Ff59931d1182",
    "0x53f14744F15365a0323B4FF0693E9190fFBE4B62",
    "0xBAff4c732634b929033917E5dF30A52EFee554ff",
    "0xf7df7AC55F06892f52Bfe62311434bC3B9647c89"
]}

async function tvl(_, _1, _2, { api }) {
    const balances = {};
    if (api.chain in INDEX_TOKEN_CONTRACT) {
        indexComponents = await api.call({
            abi: "address[]:allComponents",
            target: INDEX_TOKEN_CONTRACT[api.chain],
        })
        const underlayingBalances = await api.multiCall({
            calls: indexComponents.map(token => ({
                target: token,
                params: [INDEX_TOKEN_CONTRACT[api.chain]]
            })),
            abi: 'erc20:balanceOf',
            withMetadata: true,
        });
        underlayingBalances.map(async balance => {
            await sdk.util.sumSingleBalance(balances, balance.input.target, balance.output, api.chain)
        })
    } 
    if (api.chain in DCA_PORTFOLIO_CONTRACTS) {
        for (i in DCA_PORTFOLIO_CONTRACTS[api.chain]) {
            await addDCAEquityValuationToBalances(balances, DCA_PORTFOLIO_CONTRACTS[api.chain][i], api)
        }
    }
    if (api.chain == "avax") {
        await addEquityValuationToBalances(balances, CALM_PORTFOLIO_CONTRACT, api)
        await addEquityValuationToBalances(balances, AMBITIOUS_PORTFOLIO_CONTRACT, api)
    }
    return balances;
  }

  async function addEquityValuationToBalances(balances, address, api) {
    usdc_balance = await api.call({
        target: address,
        abi: "function getEquityValuation(bool startIndex_, bool endIndex_) view returns (uint256)",
        params: [true, false],
    })
    await sdk.util.sumSingleBalance(balances, USDC_TOKEN_CONTRACT, usdc_balance, api.chain)
  }

  async function addDCAEquityValuationToBalances(balances, address, api) {
    equity = await api.call({
        target: address,
        abi: "function equityValuation() view returns (uint256,uint256,uint256,uint256,address)",
    })
    await sdk.util.sumSingleBalance(balances, USDC_TOKEN_CONTRACT, equity[2], api.chain)
    await sdk.util.sumSingleBalance(balances, equity[4], equity[3], api.chain)
  }
  
  module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'TVL in brokkr indexes',
    start: 1554848955,  // 04/09/2019 @ 10:29pm (UTC)
    avax: {
      tvl,
    }
  }; 