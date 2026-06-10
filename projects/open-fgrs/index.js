const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryV1Beta1, queryV1Beta1V2, endPoints } = require('../helper/chain/cosmos.js');

const fgrsBaseDenom = "nfgrd"

// Testing
// export LLAMA_DEBUG_MODE="true" 
// $ node test.js projects/open-fgrs/index.js

const provenanceUrl = endPoints["provenance"] + `/cosmos/bank/v1beta1/supply/by_denom?denom=${fgrsBaseDenom}`

const tvl = async (api) => {
    try {
        const response = await fetch(provenanceUrl)
        if (!response.ok) {
            const body = await response.text();
            throw new Error( `Failed to fetch provenance ${fgrsBaseDenom} amount: ${response.status} ${body}`)
        }
        const nfgrdSupply = await response.json()
        api.add(fgrsBaseDenom, nfgrdSupply.amount.amount)
        return sumTokens2({ api })
    } catch (e) {
        throw new Error(`Failed to return FGRS TVL: ${e.message}`)
    }
}

module.exports = {
    timetravel: false,
    methodology: "OPEN FGRS TVL is the sum of all FGRS tokens on Provenance",
    provenance: { tvl },
}