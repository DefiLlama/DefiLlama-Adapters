const { get } = require("../helper/http")
const { sumTokens2 } = require('../helper/unwrapLPs');
const { endPoints: { provenance } } = require('../helper/chain/cosmos.js');

const figureContract = 'scope1qrm5d0wjzamyywvjuws6774ljmrqu8kh9x'

const contractEndpoint = (contractId) => 
    `${provenance}/provenance/metadata/v1/scope/${contractId}/record/token`

const tvl = async (api) => {
    const records = await get(contractEndpoint(figureContract))
    const totalSupply = JSON.parse(records.records[0].record.outputs[0].hash).supply
    api.add('USDC', totalSupply / 1000)
    return sumTokens2({ api })
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'TVL is calculated based on the value of the total amount of loans placed on the blockchain',
    provenance: {
        tvl,
    }
}