const { getTokenSupplies } = require('../helper/solana');

const PST = '59obFNBzyTBGowrkif5uK7ojS58vsuWz3ZCvg6tfZAGw';

async function tvl(api) {
    const supplies = await getTokenSupplies([PST]);
    api.add(PST, supplies[PST]);
}

module.exports = {
    doublecounted: true,
    methodology: "TVL counts the total supply of PST, which is backed by externally deployed USDC deposits.",
    solana: { tvl }
}
