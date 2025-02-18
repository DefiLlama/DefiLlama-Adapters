const LEGACY_TOKEN_CONTRACT = '0xD38B305CaC06990c0887032A02C03D6839f770A8';
const VESTING_CONTRACTS_BSC = ['0xeE1AD0AfAD50feCc25BDc07c18D4ec7bA5834F38', '0x7bB6Dc4d4989A9cf2f7246FcdD1DB61F9F227Ca2',
    '0x7c931f00B94829A5CDA32e5c13bBB8B8f75548EE', '0xe4e3F7798e35e76992bed655A1cFf3ad51611520', '0x4112D411D90bb3d098DC3B700CDCD8C6E6EC7D86'];

async function tvl(api) {
    let totalCollateralBalance = 0n; // Use BigInt for precision
    
    for (const contract of VESTING_CONTRACTS_BSC) {
        const balance = await api.call({
            abi: 'erc20:balanceOf',
            target: LEGACY_TOKEN_CONTRACT,
            params: [contract],
        });
        totalCollateralBalance += BigInt(balance);
    }
    
    api.add(LEGACY_TOKEN_CONTRACT, totalCollateralBalance);
}

module.exports = {
  methodology: 'counts the number of LGCT tokens in Vesting contracts contract.',
  start: 1000235,
  bsc: {
    tvl,
  },
}; 