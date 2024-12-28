const axios = require("axios");
const { sleep } = require("./utils");

const token = {}

const HEADERS = {
    "Content-Type": "application/json",
    "X-API-KEY": process.env.ALLIUM_API_KEY,
};

async function startAlliumQuery(sqlQuery) {
    const query = await axios.post(`https://api.allium.so/api/v1/explorer/queries/phBjLzIZ8uUIDlp0dD3N/run-async`, {
        parameters: {
            fullQuery: sqlQuery
        }
    }, {
        headers: HEADERS
    })

    return query.data["run_id"]
}

async function retrieveAlliumResults(queryId) {
    const results = await axios.get(`https://api.allium.so/api/v1/explorer/query-runs/${queryId}/results?f=json`, {
        headers: HEADERS
    })
    return results.data.data
}

async function queryAllium(sqlQuery) {
    for (let i = 0; i < 20; i++) {
        if (!token[sqlQuery]) {
            token[sqlQuery] = await startAlliumQuery(sqlQuery);
        }

        if (!token[sqlQuery]) {
            throw new Error("Couldn't get a token from allium")
        }

        const statusReq = await axios.get(`https://api.allium.so/api/v1/explorer/query-runs/${token[sqlQuery]}/status`, {
            headers: HEADERS
        })

        const status = statusReq.data
        if (status === "success") {
            try {
                const results = await retrieveAlliumResults(token[sqlQuery])
                return results
            } catch (e) {
                console.log("query result", e)
                throw e
            }
        } else if (status === "failed") {
            console.log(`Query ${sqlQuery} failed`, statusReq.data)
            throw new Error(`Query ${sqlQuery} failed, error ${JSON.stringify(statusReq.data)}`)
        }
        await sleep(20e3)
    }
    throw new Error("Not processed in time")
}

module.exports = {
    queryAllium,
    startAlliumQuery,
    retrieveAlliumResults
}