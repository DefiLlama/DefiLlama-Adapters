const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { default: BigNumber } = require('bignumber.js');

const CHAIN = "smartbch"

const JOYBOT_STAKING_CONTRACT = "0x498B8524c7C309471b65aEAC4f16551776B80e0F"

const staking = async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, CHAIN, chainBlocks, false)
    const total = (await sdk.api.abi.call({
        target: JOYBOT_STAKING_CONTRACT,
        abi: {
            "inputs": [],
            "name": "_totalSupply",
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

    const floorPrice = 500; // 500 JOY to mint an NFT
    return { 'joystick-2': BigNumber(total).multipliedBy(floorPrice) }
}

module.exports = {
    misrepresentedTokens: false,
    methodology: "Total value of NFTs sent to staking contract is counted towards staking metric",
    smartbch: {
        tvl: () => ({}),
        staking: staking,
    },
}
