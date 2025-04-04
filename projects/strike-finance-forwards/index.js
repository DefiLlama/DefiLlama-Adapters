const { sumTokens2 } = require('../helper/chain/cardano');
const { getTxUtxos } = require('../helper/chain/cardano/blockfrost');
const { get } = require("../helper/http")

const strikeStaking = 'addr1z9yh4zcqs4gh78ysvh8nqp40fsnxg49nn3h6x25az9k8tms6409492020k6xml8uvwn34wrexagjh5fsk5xk96jyxk2qf3a7kj'
const strikeTokenAddress = 'f13ac4d66b3ee19a6aa0f2a22298737bd907cc95121662fc971b5275535452494b45'

// Helper function used to fetch contract addresses from tx hash
async function fetchContractAddresses(positionsTxHashes) {
    const contractAddresses = await Promise.all(
        positionsTxHashes.map(async ({ txHash, outputIndex }) => {
            const txUtxos = await getTxUtxos(txHash);
            return txUtxos?.outputs?.[outputIndex]?.address || null;
        })
    );

    return contractAddresses.filter(Boolean); // Remove null or undefined
}

async function tvl() {
    const allPositions = await get('https://beta.strikefinance.org/api/forwards/getAllForwards');
    const positionsTxHashes = allPositions.forwards.map(({ outRef }) => outRef);
    const uniqueContractAddresses = [...new Set(await fetchContractAddresses(positionsTxHashes))];
    return await sumTokens2({ owners: uniqueContractAddresses });
}

async function stake() {
    return await sumTokens2({
        owner: [strikeStaking],
        tokens: [strikeTokenAddress]
    });
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl,
        staking: stake
    },
}
