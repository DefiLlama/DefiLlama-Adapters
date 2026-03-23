const abi = {
  "getGardens": "address[]:getGardens",
  "getGardenDetails": "function getGardenDetails(address _garden) view returns (string gardenName, string symbol , address[5] creators, address reserveAsset, bool[4] arr1, address[] strategies, address[] finalizedStrategies, uint256[10] voteParams, uint256[10] capitalArr, uint256[3] profits)",
  "getCompleteStrategy": "function getCompleteStrategy(address _strategy) view returns (address, string name, uint256[16] strategyProps, bool[], uint256[])"
}
const { sumTokens2 } = require("../helper/unwrapLPs");

const babController = '0xd4a5b5fcb561daf3adf86f8477555b92fba43b5f'
const babylonViewer = '0x740913FEF40720E82498D5b73A4E8C3a5D9b9d79'

async function tvl(api) {
    let gardens = await api.call({  abi: abi.getGardens, target: babController})


    const gardensToIgnore = ["0xB0EE8C61c78aA9B7ED138bcC6bce7ABeC8470038", "0xF0AF08d7bc6e4aE42b84771aE3f9DA7D8e58b083", "0x4f5721Ce7F02586D67eA0CC6003e889E974DC9A0", "0xab051B83eecA40084855e289E2531D22F9AffD21"].map(i => i.toLowerCase())
    gardens = gardens.map(i => i.toLowerCase()).filter(i => !gardensToIgnore.includes(i))
    const gardensDetails = await api.multiCall({  abi: abi.getGardenDetails, calls: gardens, target: babylonViewer })
    const strategies = []
    const tokens = []

    for (const gardenDetails of gardensDetails) {
        const garden_idle = gardenDetails.capitalArr[9]
        api.add(gardenDetails.reserveAsset, garden_idle)
        gardenDetails.strategies.forEach(strategy => {
            strategies.push(strategy)
            tokens.push(gardenDetails.reserveAsset)
        })
    }
    const strategiesDetails = await api.multiCall({  abi: abi.getCompleteStrategy, calls: strategies, target: babylonViewer})
    const bals = strategiesDetails.map(i => i.strategyProps[10])
    api.add(tokens, bals)
}

async function staking(api) {
    const harvest_vault = '0xadB16dF01b9474347E8fffD6032360D3B54627fB'
    return sumTokens2({ api, owner: harvest_vault, resolveUniV3: true,})
}

module.exports = {
    methodology: "TVL of Babylon corresponds to capital locked into each garden (idle capital waiting to be deployed) as well as capital deployed to each strategy of these gardens",
    ethereum: {
        staking,
        tvl
    }
}
