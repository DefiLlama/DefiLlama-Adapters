const { request } = require("graphql-request");
const { cachedGraphQuery } = require('../../cache')

const API_URL = "https://mainnet-api.hatom.com/graphql";

// const client = async (query, variables) => {
//    // return request(API_URL, query, variables);
//    return request(API_URL, query, variables);
// };

const client = async (key, query, variables) => {
   return cachedGraphQuery(key, API_URL, query, variables);
};

module.exports = client;
