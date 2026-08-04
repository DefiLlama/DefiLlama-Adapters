const ADDRESSES = require('../helper/coreAssets.json');

// AID.v0 token address (same on all chains: Ethereum, BNB Chain, Base, Arbitrum)
const AID_TOKEN = '0x18F52B3fb465118731d9e0d276d4Eb3599D57596';

const totalSupplyABI = "function totalSupply() external view returns (uint256)";

async function tvl(api) {
   const supply = await api.call({target: AID_TOKEN, abi: totalSupplyABI})

   api.add(AID_TOKEN, supply)
}

module.exports = {
    methodology: 'Tracks AID total supply on Ethereum, Arbitrum, Base, and BSC.',
    start: 1715490671,
    timetravel: true,
    misrepresentedTokens: true,
    ethereum: { tvl },
    arbitrum: { tvl },
    base: { tvl },
    bsc: { tvl }
};