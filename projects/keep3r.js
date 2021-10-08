const sdk = require("@defillama/sdk");
const keep3rAddress = '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44';
const totalBondedAbi = {
    "inputs": [],
    "name": "totalBonded",
    "outputs": [
    {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }
    ],
    "stateMutability": "view",
    "type": "function"
};
async function staking(timestamp, block) {
    const bondedKeep3r = (
        await sdk.api.abi.call({
          target: keep3rAddress,
          abi: totalBondedAbi,
          block,
        })
      ).output;
    return { [keep3rAddress] : bondedKeep3r };
};
async function tvl(timestmpa, block) {
    return {};
};
module.exports  = {
    tvl,
    staking: {
        tvl: staking
    }
};