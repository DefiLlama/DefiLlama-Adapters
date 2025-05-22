const MINT_TOKEN_CONTRACT = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const addresses = [
    "0x19d531fb5369a25a8497e606ba131fa85e2026fc",
    "0xa3820605c53922c43d0293bbda8975aedfd2bef8",
    "0x5794ca8ec8eafab6da6f3a803f45cc826f9ab4f8",
    "0x433242ffec1d52a2d8f8fc99223b6f94443a53a9",
    "0x5f34719fdf6ef2808394d27cc46056ad3b2baa41",
    "0x2f65ab18a09b19afee58610dee7224175be3e38b",
    "0x2ae2cc95da1e90cd94a6fda8a1a16c756ef9aafa"
];

async function tvl(api) {
    const collateralBalance = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: addresses.map(addr => ({
            target: MINT_TOKEN_CONTRACT,
            params: [addr],
        })),
    });

    const total = collateralBalance.reduce((a, b) => a + BigInt(b), 0n);
    api.add(MINT_TOKEN_CONTRACT, total.toString());
}

module.exports = {
    ethereum: {
        tvl
    },
};
