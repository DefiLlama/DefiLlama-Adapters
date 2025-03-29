const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const NODE_URL = "https://xrplcluster.com";
// ref: https://docs.doppler.finance/xrpfi/cedefi-yields#what-makes-doppler-finance-different-from-other-cedefi
// rEPQxsSVER2r4HeVR4APrVCB45K68rqgp2: Fireblocks, A wallet which filters out abnormal deposits
// rprFy94qJB5riJpMmnPDp3ttmVKfcrFiuq: Fireblocks, A wallet which receives and stores properly deposited funds from the deposit wallet. The funds accumulated in this wallet are transferred to ceffu once a week.
// rp53vxWXuEe9LL6AHcCtzzAvdtynSL1aVM: Ceffu, Under Ceffu custody, the assets in this wallet can be delegated to Binance. Once the delegation is complete, the balance is no longer recorded on-chain for this wallet.

async function getAccountBalance(address) {
    const payload = {
        method: "account_info",
        params: [{
            account: address,
            ledger_index: "validated"
        }]
    };

    try {
        const { data } = await axios.post(NODE_URL, payload);
        if (data.result && data.result.account_data) {
            return data.result.account_data.Balance;
        }
        return 0; 
    } catch (error) {
        return 0;
    }
}

async function fetchAccountTransactions(address, marker = null, transactions = []) {
    const payload = {
        method: "account_tx",
        params: [{
            account: address,
            ledger_index_min: -1,
            ledger_index_max: -1,
            binary: false,
            limit: 5000,
            marker: marker
        }]
    };
    
    if (marker === null) {
        delete payload.params[0].marker;
    }

    try {
        const { data } = await axios.post(NODE_URL, payload);
        
        if (data.result && data.result.transactions) {
            transactions = transactions.concat(data.result.transactions);
        }
        
        if (data.result && data.result.marker) {
            return await fetchAccountTransactions(address, data.result.marker, transactions);
        }
        
        return transactions;
    } catch (error) {
        return transactions;
    }
}

// Calculate net flow of Treasury wallet excluding transactions with Ceffu
async function calculateTreasuryNetFlow(treasuryAddress, ceffuAddress) {
    const transactions = await fetchAccountTransactions(treasuryAddress);
    let netFlow = 0;
    
    transactions.forEach(tx => {
        const transaction = tx.tx || {};

        if (transaction.TransactionType === 'Payment') {
            // Inflows to Treasury (excluding from Ceffu)
            if (transaction.Destination === treasuryAddress && transaction.Account !== ceffuAddress) {
                netFlow += parseInt(transaction.Amount);
            }
            
            // Outflows from Treasury (excluding to Ceffu)
            if (transaction.Account === treasuryAddress && transaction.Destination !== ceffuAddress) {
                netFlow -= parseInt(transaction.Amount);
            }
        }
    });
    
    return netFlow;
}

const tvl = async (api) => {
    const fbTreasuryAddress = "rprFy94qJB5riJpMmnPDp3ttmVKfcrFiuq";
    const ceffuAddress = "rp53vxWXuEe9LL6AHcCtzzAvdtynSL1aVM";
    
    // Calculate Treasury's net flow excluding Ceffu transactions
    const treasuryNetFlow = await calculateTreasuryNetFlow(fbTreasuryAddress, ceffuAddress);
    const netFlowToAdd = treasuryNetFlow > 0 ? treasuryNetFlow : 0;

    // Add to TVL
    api.add(ADDRESSES.ripple.XRP, netFlowToAdd);
}

module.exports = {
    timetravel: false,
    methodology: "Counts the XRP in Doppler Finance's deposit wallet, treasury wallet, and the net inflow to the Treasury wallet (excluding transactions with Ceffu).",
    ripple: {
        tvl
    }
};