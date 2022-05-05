const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { default: BigNumber } = require('bignumber.js');

const CHAIN = "smartbch"

// token contract
const CLY = "0x7642df81b5beaeeb331cc5a104bd13ba68c34b91"

const getTotalStakingSupply = async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, CHAIN, chainBlocks, false)
    const total = (await sdk.api.abi.call({
        target: CLY,
        abi: {
            "inputs": [],
            "name": "getTotalStakingSupply",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
        chain: CHAIN,
        block
    })).output

    return {'celery': BigNumber(total).dividedBy(10 ** 18)}
}

module.exports = {
    misrepresentedTokens: false,
    methodology: "Contract function is called to get the total staked CLY tokens in the smart contract",
    smartbch: {
        tvl: () => ({}),
        staking: getTotalStakingSupply,
    },
}
