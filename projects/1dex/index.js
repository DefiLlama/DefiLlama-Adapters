const { post } = require("../helper/http");

const endpoint = 'https://eos.greymass.com/v1'; 

const symbolToCoingeckoId = {
    'EOS': 'eos',
    'USDT': 'tether',
    'BTC': 'bitcoin',
    'RAMS': 'ramses-exchange',
    'XSAT': 'exsat-network',
};

async function getContractActions(contract, actionNames) {
    const allActions = [];
    const pageSize = 100;
    let pos = -1;
    let hasMore = true;
    
    while (hasMore) {
        try {
            const response = await post(`${endpoint}/history/get_actions`, {
                account_name: contract,
                pos: pos,
                offset: -pageSize  
            });
            
            const actions = response.actions || [];
            if (actions.length === 0) break;
            
            const filteredActions = actions.filter(action => 
                Array.isArray(actionNames) 
                    ? actionNames.includes(action.action_trace.act.name)
                    : action.action_trace.act.name === actionNames
            );
            
            allActions.push(...filteredActions);

            const lastAction = actions[actions.length - 1];
            pos = lastAction.account_action_seq - pageSize + 1;
            hasMore = actions.length === pageSize;
            
        } catch (error) {
            console.error('Pagination error:', error.message);
            break;
        }
    }
    
    return allActions;
}

function calculateBalancesFromActions(actions) {
    const balances = {};
    
    for (const action of actions) {
        const { name, data } = action.action_trace.act;
        const { quantity, contract } = data;
        const [amount, symbol] = quantity.split(' ');
        
        if (!balances[symbol]) {
            balances[symbol] = {
                amount: 0,
                contract,
                symbol
            };
        }
        
        const parsedAmount = parseFloat(amount);
        balances[symbol].amount += name === 'logdeposit1' ? parsedAmount : -parsedAmount;
    }
    
    return balances;
}

function convertToDefiLlamaFormat(balances) {
    const result = {};
    
    for (const [symbol, data] of Object.entries(balances)) {
        if (data.amount > 0 && symbolToCoingeckoId[symbol]) {
            result[symbolToCoingeckoId[symbol]] = data.amount;
        }
    }
    
    return result;
}

async function eos() {
    try {
        const actions = await getContractActions("portal.1dex", ["logdeposit1", "logwithdraw1"]);
        const balances = calculateBalancesFromActions(actions);
        return convertToDefiLlamaFormat(balances);
    } catch (error) {
        console.error('Error fetching 1DEX TVL:', error);
        return {};
    }
}

module.exports = {
    methodology: `1DEX TVL is calculated by tracking deposit and withdrawal actions (logdeposit1 and logwithdraw1) from the portal.1dex contract.`,
    eos: {
        tvl: eos,
    },
}
