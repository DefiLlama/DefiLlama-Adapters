const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const DOPPLER_API_URL = "https://api.doppler.finance/v2/staking-info";
const DOPPLER_PARTNER_API_URL = "https://partner.doppler.finance";
const XRPL = "xrpl";
const ETHEREUM = "ethereum";
const XRPL_RLUSD_ADDRESS = "524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De";
const ETHEREUM_RLUSD_ADDRESS = "0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD";
// ref: https://docs.doppler.finance/xrpfi/cedefi-yields#what-makes-doppler-finance-different-from-other-cedefi
// rEPQxsSVER2r4HeVR4APrVCB45K68rqgp2: Fireblocks, A wallet which filters out abnormal deposits
// rprFy94qJB5riJpMmnPDp3ttmVKfcrFiuq: Fireblocks, A wallet which receives and stores properly deposited funds from the deposit wallet. The funds accumulated in this wallet are transferred to ceffu once a week.
// rp53vxWXuEe9LL6AHcCtzzAvdtynSL1aVM: Ceffu, Under Ceffu custody, the assets in this wallet can be delegated to Binance. Once the delegation is complete, the balance is no longer recorded on-chain for this wallet.
// Ceffu is similar to CEX wallets, making it impossible to track Doppler's balance on-chain
// Our api response is sum of fireblocks and ceffu balances

// Partner Vault
// rDkfnysh6MmpitowwYm3cEyYKzLG2zEWEX: Fireblocks, Partner Vault 1
// rHsvjnyYoAZFajhti4mb5bhcXTxLebqpKK: Fireblocks, Partner Vault 2
const xrplTvl = async (api) => {
    // ### Main Vault ###
    // XRP
    const { data } = await axios.get(`${DOPPLER_API_URL}/token/XRP`);
    if (!data) {
        throw new Error('Invalid API response');
    }

    for (const d of data) {
        const { totalStaked, pendingWithdrawalAmount, chain } = d;
        if (chain === XRPL) {
            const total = Number(totalStaked) + Number(pendingWithdrawalAmount);
            api.add(ADDRESSES.ripple.XRP, total * 1e6); // Convert to drops (1 XRP = 1,000,000 drops)
        }
    }

    // RLUSD
    const { data: rlUSDData } = await axios.get(`${DOPPLER_API_URL}/token/RLUSD`);
    if (!rlUSDData) {
        throw new Error('Invalid API response');
    }

    for (const d of rlUSDData) {
        const { totalStaked, pendingWithdrawalAmount, chain } = d;
        if (chain === XRPL) {
            const total = Number(totalStaked) + Number(pendingWithdrawalAmount);
            api.add(XRPL_RLUSD_ADDRESS, total * 1e6);
        }
    }

    // ### Partner Vault ###
    const { data: partnerData } = await axios.get(`${DOPPLER_PARTNER_API_URL}/v1/bridge/vaults/balance/XRP`);
    if (!partnerData) {
        throw new Error('Invalid API response');
    }
    const { totalBalance } = partnerData;
    api.add(ADDRESSES.ripple.XRP, totalBalance * 1e6);
}

const ethereumTvl = async (api) => {
    const { data } = await axios.get(`${DOPPLER_API_URL}/token/RLUSD`);
    if (!data) {
        throw new Error('Invalid API response');
    }

    for (const d of data) {
        const { totalStaked, pendingWithdrawalAmount, chain } = d;
        if (chain === ETHEREUM) {
            const total = Number(totalStaked) + Number(pendingWithdrawalAmount);
            api.add(ETHEREUM_RLUSD_ADDRESS, total * 1e18);
        }
    }
}

module.exports = {
    ripple: {
        tvl: xrplTvl
    },
    ethereum: {
        tvl: ethereumTvl
    }
};