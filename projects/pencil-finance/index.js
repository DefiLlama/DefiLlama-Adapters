const ADDRESSES = require('../helper/coreAssets.json');

const VAULT_CONTRACT = '0xca0Ab9eD8ae0720f955b129E0C7c9d8c1Aa6fb72'; // Pencil Finance Staking Vault
const WEDU_CONTRACT = ADDRESSES.occ.WEDU;

async function tvl(api) {
    const totalAssets = await api.call({
        abi: 'function totalAssets() view returns (uint256)',
        target: VAULT_CONTRACT,
        chain: 'occ',
    });

    api.add(WEDU_CONTRACT, totalAssets);
}

module.exports = {
    methodology: 'TVL is calculated based on totalAssets() (WEDU tokens) held by the Pencil Finance Staking Vault on EduChain (OCC chain).',
    start: 1745906937,
    occ: {
        tvl,
    },
};
