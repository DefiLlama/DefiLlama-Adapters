const { post } = require("../helper/http");

const endpoint = 'https://exsat2.greymass.com/v1'; 

const symbolToCoingeckoId = {
    'EOS': 'eos',
    'USDT': 'tether',
};

async function getContractActionsWithPagination(contract, actionName) {
    try {
        let allActions = [];
        let pos = -1;
        const pageSize = 100;
        let hasMore = true;
        let oldestActionSeq = null;
        
        while (hasMore) {
            try {
                const response = await post(`${endpoint}/history/get_actions`, {
                    account_name: contract,
                    pos: pos,
                    offset: -pageSize  
                });
                
                if (!response.actions || response.actions.length === 0) {
                    hasMore = false;
                    break;
                }
                
                const filteredActions = response.actions.filter(action => {
                    if (Array.isArray(actionName)) {
                        return actionName.includes(action.action_trace.act.name);
                    }
                    return action.action_trace.act.name === actionName;
                });
                
                if (filteredActions.length > 0) {
                    allActions = [...allActions, ...filteredActions];
                }
                
                if (response.actions.length > 0) {
                    const lastAction = response.actions[response.actions.length - 1];
                    oldestActionSeq = lastAction.account_action_seq;
                    pos = oldestActionSeq - pageSize + 1;
                    
                    if (response.actions.length < pageSize) {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
                
            } catch (error) {
                hasMore = false;
            }
        }
        return allActions;
    } catch (error) {
        console.error('Error during pagination:', error);
        return [];
    }
}

function convertToDefiLlamaFormat(balances) {
    const result = {};
    
    Object.entries(balances).forEach(([symbol, data]) => {
        if (data.amount > 0) {
            const coingeckoId = symbolToCoingeckoId[symbol];
            if (coingeckoId) {
                result[coingeckoId] = data.amount;
            }
        }
    });
    
    return result;
}


async function calculateTVLFromActions(contract) {
    try {
        const actions = await getContractActionsWithPagination(contract, ["logdeposit1", "logwithdraw1"]);
        
        const balances = {};
        
        actions.forEach(action => {
            const { action_trace } = action;
            const { act } = action_trace;
            const { name, data } = act;
            
            if (name === 'logdeposit1') {
                const { quantity, contract } = data;
                const [amount, symbol] = quantity.split(' ');
                
                if (!balances[symbol]) {
                    balances[symbol] = {
                        amount: 0,
                        contract: contract,
                        symbol: symbol
                    };
                }
                
                balances[symbol].amount += parseFloat(amount);
            } 
            else if (name === 'logwithdraw1') {
                const { quantity, contract } = data;
                const [amount, symbol] = quantity.split(' ');
                
                if (!balances[symbol]) {
                    balances[symbol] = {
                        amount: 0,
                        contract: contract,
                        symbol: symbol
                    };
                }
                
                balances[symbol].amount -= parseFloat(amount);
            }
        });
        
        return balances;
    } catch (error) {
        console.error('Error calculating TVL from actions:', error);
        throw error;
    }
}

// 1DEX
// https://1dex.com
async function eos() {
    const actionBasedBalances = await calculateTVLFromActions("portal.1dex", 50);

    console.log(actionBasedBalances);
    

    const accountTvl = convertToDefiLlamaFormat(actionBasedBalances)
    
    return accountTvl;
}

module.exports = {
    methodology: `1DEX TVL is calculated by tracking deposit and withdrawal actions (logdeposit1 and logwithdraw1) from the portal.1dex contract.`,
    eos: {
        tvl: eos,
    },
}
