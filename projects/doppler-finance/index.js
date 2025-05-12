const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const DOPPLER_API_URL = "https://api.doppler.finance/v1/xrpfi/staking-info";
// ref: https://docs.doppler.finance/xrpfi/cedefi-yields#what-makes-doppler-finance-different-from-other-cedefi
// rEPQxsSVER2r4HeVR4APrVCB45K68rqgp2: Fireblocks, A wallet which filters out abnormal deposits
// rprFy94qJB5riJpMmnPDp3ttmVKfcrFiuq: Fireblocks, A wallet which receives and stores properly deposited funds from the deposit wallet. The funds accumulated in this wallet are transferred to ceffu once a week.
// rp53vxWXuEe9LL6AHcCtzzAvdtynSL1aVM: Ceffu, Under Ceffu custody, the assets in this wallet can be delegated to Binance. Once the delegation is complete, the balance is no longer recorded on-chain for this wallet.
// Ceffu is similar to CEX wallets, making it impossible to track Doppler's balance on-chain
// Our api response is sum of fireblocks and ceffu balances
const tvl = async (api) => {
    const { data } = await axios.get(DOPPLER_API_URL);
    if (!data || !data[0]) {
        throw new Error('Invalid API response');
    }

    const stakingInfo = data[0];
    const { totalStaked } = stakingInfo;

    api.add(ADDRESSES.ripple.XRP, totalStaked * 1e6); // Convert to drops (1 XRP = 1,000,000 drops)
}

module.exports = {
    ripple: {
        tvl
    }
};