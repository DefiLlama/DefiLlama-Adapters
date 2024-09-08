const sdk = require('@defillama/sdk');

const TOKENS = [
  '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd', // axlUSDC
  '0xA8759ca1758fBd8db3BA14C31d2284ae58a64CD1'  // MCT
];

const INVESTMENT_CONTRACT = '0x951d1571C75C519Cc3D09b6B71595C6aCe1c06dB'; // Investment Contract

async function tvl(_, block, chainBlocks) {
    const balances = {};

    const tokenBalances = await sdk.api.abi.multiCall({
        calls: TOKENS.map(token => ({
            target: token,
            params: [INVESTMENT_CONTRACT] 
        })),
        abi: 'erc20:balanceOf',
        chain: 'haqq',
        block: chainBlocks['haqq'], 
    });

    sdk.util.sumMultiBalanceOf(balances, tokenBalances);

    console.log("Balances:", balances); 
    return balances;
}

module.exports = {
  haqq: {
    tvl
  },
};
