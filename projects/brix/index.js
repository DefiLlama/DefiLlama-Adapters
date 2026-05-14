const ITRY_TOKEN = '0xb492B4aFD9658093694CF9452D5C272e8230F3B0';

async function tvl(api) {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: ITRY_TOKEN });
  api.add(ITRY_TOKEN, totalSupply);
}

module.exports = {
  methodology: 'TVL is the total iTRY supply on Ethereum. iTRY is a TRY-pegged stablecoin backed 1:1 by Turkish money market funds. Cross-chain iTRY is locked in the LayerZero OFT adapter on Ethereum, so Ethereum totalSupply covers all chains.',
  ethereum: {
    tvl,
  },
};
