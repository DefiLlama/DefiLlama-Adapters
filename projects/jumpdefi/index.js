const axios = require("axios");
const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const { BigNumber } = require("bignumber.js");
const { uniTvlExport } = require("../helper/unknownTokens");

const chain = "telos";
const factory = "0xff59EBFf3e3F72E8162eA2aB0a0d1C9258692dF5";
module.exports = uniTvlExport(chain, factory);
