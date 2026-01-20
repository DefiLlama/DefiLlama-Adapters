const { queryContract } = require("./chain/cosmos");

/**
 * Query all program configs from the registry contract
 * @param {string} registryAddress - The address of the registry contract
 * @returns {Promise<Array>} - An array of program configs with id and program_config
 */
async function queryValencePrograms(registryAddress) {
    const allProgramConfigs = []

    const lastProgramId = await queryContract({
        contract: registryAddress,
        chain: "neutron",
        data: `{
                "get_last_id": {}
        }`
    });

    let programIdStartIndex = 0;

    while (programIdStartIndex < lastProgramId) {
        const programConfigs = (await queryContract({
            contract: registryAddress,
            chain: "neutron",
            data: `{
                "get_all_configs": {
                    "limit": 50,
                    "start": ${programIdStartIndex}
                }
            }`,
        }))
        const endId = programConfigs[programConfigs.length - 1].id;
        programIdStartIndex = endId + 1;
        allProgramConfigs.push(...programConfigs);
    }

    return Promise.all(allProgramConfigs.map(async (program)=>{
        const programId=program.id;
        const encodedProgramConfig=program.program_config;
        const decodedBinaryString = Buffer.from(encodedProgramConfig, 'base64')
        return {
            id: programId,
            program_config:  JSON.parse(decodedBinaryString)
        }
    }))
}


/***
 * Extract the account addresses for a given domain and chain from a program config
 * The format of programAccounts is [{domain:{chain:address},addr:address}]
 */
function extractAccountsFromProgramConfig(programAccounts,domain,chain) {
    let filter = chain
    if (filter==="terra2") filter="terra" // handling edge case, in Valence the chain name is configured as "terra" but refers to terra2 (phoenix-1)
    return programAccounts.filter((accountConfig)=>domain in accountConfig.domain && accountConfig.domain[domain] === filter).map((accountConfig)=>{
       return accountConfig.addr
    })
}




module.exports = {
    queryValencePrograms,
    extractAccountsFromProgramConfig
}