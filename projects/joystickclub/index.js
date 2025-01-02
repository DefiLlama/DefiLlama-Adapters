const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

const chain = "smartbch"

const JOYBOT_STAKING_CONTRACT = "0x498B8524c7C309471b65aEAC4f16551776B80e0F"

const staking = async (timestamp, ethBlock, {[chain]: block}) => {
    const total = (await sdk.api.abi.call({
        target: JOYBOT_STAKING_CONTRACT,
        abi: "uint256:_totalSupply",
        chain,
        block
    })).output

    const floorPrice = 500; // 500 JOY to mint an NFT
    return { 'joystick1': BigNumber(total).multipliedBy(floorPrice) }
}

module.exports = {
        methodology: "Total value of NFTs sent to staking contract is counted towards staking metric",
    smartbch: {
        tvl: () => ({}),
        staking: staking,
    },
}
