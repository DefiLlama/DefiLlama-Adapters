require('dotenv').config()
const axios = require("axios");
const { sleep } = require("./utils");
const retry = require("async-retry");
const pLimit = require("p-limit");

const _rateLimited = pLimit(3)
const rateLimited = (fn) => (...args) => _rateLimited(() => fn(...args))

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

async function _queryAllium(sqlQuery) {
    const _response = retry(
        async (bail) => {
            if (!token[sqlQuery]) {
                try {
                    token[sqlQuery] = await startAlliumQuery(sqlQuery);
                } catch (e) {
                    console.log("query run-async", e);
                    throw e
                }
            }

            if (!token[sqlQuery]) {
                throw new Error("Couldn't get a token from allium")
            }

            const statusReq = await axios.get(`https://api.allium.so/api/v1/explorer/query-runs/${token[sqlQuery]}/status`, {
                headers: HEADERS
            })

            const status = statusReq.data
            if (status === "success") {
                return retrieveAlliumResults(token[sqlQuery])
            } else if (status === "failed") {
                console.log(`Query ${sqlQuery} failed`, statusReq.data)
                bail(new Error(`Query ${sqlQuery} failed, error ${JSON.stringify(statusReq.data)}`))
                return;
            }
            throw new Error("Still running")
        },
        {
            retries: 15,
            maxTimeout: 1000 * 60 * 2, // 2 minutes
            minTimeout: 1000 * 10, // 10 seconds
            randomize: true,
        }
    );

    return await _response
}

const queryAllium = rateLimited(_queryAllium);

module.exports = {
    queryAllium,
    startAlliumQuery,
    retrieveAlliumResults
}