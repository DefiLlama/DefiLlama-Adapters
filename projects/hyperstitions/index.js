// projects/hyperstitions/index.js
const HYPERSTITIONS_CONTRACT = '0x97b4a6b501C55cCC7A597E259266E7E28A2d0BE0';
const HST_TOKEN = '0x97401d48a80b15bc7291599e24b590eedcd7ce37';

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: HST_TOKEN,
    params: [HYPERSTITIONS_CONTRACT],
  });
  
  // Add using CoinGecko ID directly
  api.addCGToken('hyperstitions', balance / 1e18);
}

module.exports = {
  methodology: 'TVL is the HST token balance locked in the Hyperstitions prediction market contract.',
  monad: {
    tvl,
  },
};