const { sumTokensExport } = require("../helper/unwrapLPs");

const TREASURY = "0xff70Cd1E1931372F869c936582a7F42e49B6DA4c";
const HESTIA = "0xbc7755a153e852cf76cccddb4c2e7c368f6259d8";
const CIRCLE = "0x5babfc2f240bc5de90eb7e19d789412db1dec402";
const PHESTIA = "0xF760fD8fEB1F5E3bf3651E2E4f227285a82470Ff";
const PCIRCLE = "0x55A81dA2a319dD60fB028c53Cb4419493B56f6c0";

module.exports = {
    base: {
        tvl: sumTokensExport({ owner: TREASURY, tokens: [HESTIA, CIRCLE, PHESTIA, PCIRCLE], }),
    },
};