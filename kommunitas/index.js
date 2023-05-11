const sdk = require('@defillama/sdk');
const KOM_TOKEN_CONTRACT = '0xC004e2318722EA2b15499D6375905d75Ee5390B8';
const KOM_STAKING_CONTRACT = [
    "0x453d0a593d0af91e77e590a7935894f7ab1b87ec",
    "0x8d37b12DB32E07d6ddF10979c7e3cDECCac3dC13",
    "0x8d34Bb43429c124E55ef52b5B1539bfd121B0C8D"
];

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};

    let tokenBalance = (await sdk.api.abi.multiCall({
        calls: KOM_STAKING_CONTRACT.map(p => ({
            target: KOM_TOKEN_CONTRACT,
            params: p
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks['polygon'],
        chain: "polygon"
    })).output;

    tokenBalance.forEach(e => {
        sdk.util.sumSingleBalance(balances, `polygon:${KOM_TOKEN_CONTRACT}`, e.output);
    });
    
    return balances;
}

module.exports = {
  polygon: {
    tvl
  }
};
// node test.js projects/kommunitas/index.js
