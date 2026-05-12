// SentrixV2 — UniswapV2-fork AMM on Sentrix Chain (chainId 7119, sdk slug `srx`).
// Source: https://github.com/sentrix-labs/sentrix-dex
// Live UI: https://dex.sentrixchain.com
//
// Factory + Router + WSRX deployments are pinned at
// https://github.com/sentrix-labs/sentrix-dex/blob/main/deployments/7119.json

const { uniTvlExport } = require('../helper/unknownTokens');

const FACTORY = '0xC5344f0DDE0B9916217449Ad9222e446475aD936'; // SentrixV2Factory

module.exports = uniTvlExport('srx', FACTORY);
