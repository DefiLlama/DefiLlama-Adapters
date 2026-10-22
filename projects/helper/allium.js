require('dotenv').config()
const pLimit = require("p-limit");
const { getEnv } = require('./env');
const { get, post } = require('./http');

// Lightweight retry function to replace async-retry
const retry = async (fn, options = {}) => {
  const { retries = 3, minTimeout = 1000, maxTimeout = 10000, randomize = false } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn((error) => {
        throw error; // bail function - immediately throw the error
      });
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and optional randomization
      let delay = Math.min(minTimeout * Math.pow(2, attempt), maxTimeout);
      if (randomize) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const _rateLimited = pLimit(3)
const rateLimited = (fn) => (...args) => _rateLimited(() => fn(...args))

const token = {}

const HEADERS = () => ({
    "Content-Type": "application/json",
    "X-API-KEY": getEnv('ALLIUM_API_KEY'),
})

async function startAlliumQuery(sqlQuery) {
    const query = await post(`https://api.allium.so/api/v1/explorer/queries/phBjLzIZ8uUIDlp0dD3N/run-async`, {
        parameters: {
            fullQuery: sqlQuery
        }
    }, {
        headers: HEADERS()
    })

    return query["run_id"]
}

async function retrieveAlliumResults(queryId) {
    const results = await get(`https://api.allium.so/api/v1/explorer/query-runs/${queryId}/results?f=json`, {
        headers: HEADERS()
    })
    return results.data
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

            const status = await get(`https://api.allium.so/api/v1/explorer/query-runs/${token[sqlQuery]}/status`, {
                headers: HEADERS()
            })

            if (status === "success") {
                return retrieveAlliumResults(token[sqlQuery])
            } else if (status === "failed") {
                console.log(`Query ${sqlQuery} failed`, status)
                bail(new Error(`Query ${sqlQuery} failed, error ${JSON.stringify(status)}`))
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