const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

const figureContract = 'scope1qrm5d0wjzamyywvjuws6774ljmrqu8kh9x'

const tvl = async (api) => {
    const records = await queryV1Beta1({
        chain: 'provenance',
        url: `metadata/v1/scope/${figureContract}/record/token`
    })
    const totalSupply = JSON.parse(records.records[0].record.outputs[0].hash).supply
    api.add('FIGR_HELOC', totalSupply / 1000)
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