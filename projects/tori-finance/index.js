const ADDRESSES = require('../helper/coreAssets.json');

const minter = '0xe16b821B9F6B0a6f06a2C4a61D5d1f71cFa53F1E';
const getCustodiansAbi = 'address[]:getCustodianAddresses';

async function tvl(api) {
    const owners = await api.call({abi: getCustodiansAbi, target: minter})

    await api.sumTokens({owners, tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT]})
}

module.exports = {
    methodology: 'Counts all tokens backing trUSD.',
    ethereum: { tvl }
}