const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const DUMPEX_ARBITRUM = '0xa570f965681d15a2b760adda2693d624295221d4';
const DUMPEX_AVALANCHE = '0xAB6aab4eb37fa4309cF22E6E65a16426fDd8E4C7';
const DUMPEX_BASE = '0xab6aab4eb37fa4309cf22e6e65a16426fdd8e4c7';
const DUMPEX_BLAST = '0x0297697af2c3616d78cb7a3ad8d15acf8f9b6711';
const DUMPEX_BSC = '0xAB6aab4eb37fa4309cF22E6E65a16426fDd8E4C7';
const DUMPEX_ETHEREUM = '0xbc06b693a1b6a02739ea7c6b3d3660bcea3fd186';
const DUMPEX_FANTOM = '0xab6aab4eb37fa4309cf22e6e65a16426fdd8e4c7';
const DUMPEX_GNOSIS = '0x35629b4749e0bf0396a11bd626ced54c6a4c2f55';
const DUMPEX_LINEA = '0xffadfa2855513f353b10cbbaad23c7d8dba5a068';
const DUMPEX_OPTIMISM = '0x404df8bc73d3632338c4e43c4971bf469a849d79';
const DUMPEX_POLYVON = '0xab6aab4eb37fa4309cf22e6e65a16426fdd8e4c7';

module.exports = {
    methodology: `Total gas token holdings in DumpEX. Does not account for tokens & NFTs in the contract.`,
    arbitrum: { tvl: sumTokensExport({ owner: DUMPEX_ARBITRUM, tokens: [nullAddress]}), },
    avax: { tvl: sumTokensExport({ owner: DUMPEX_AVALANCHE, tokens: [nullAddress]}), },
    base: { tvl: sumTokensExport({ owner: DUMPEX_BASE, tokens: [nullAddress]}), },
    blast: { tvl: sumTokensExport({ owner: DUMPEX_BLAST, tokens: [nullAddress]}), },
    bsc: { tvl: sumTokensExport({ owner: DUMPEX_BSC, tokens: [nullAddress]}), },
    ethereum: { tvl: sumTokensExport({ owner: DUMPEX_ETHEREUM, tokens: [nullAddress]}), },
    fantom: { tvl: sumTokensExport({ owner: DUMPEX_FANTOM, tokens: [nullAddress]}), },
    xdai: { tvl: sumTokensExport({ owner: DUMPEX_GNOSIS, tokens: [nullAddress]}), },
    linea: { tvl: sumTokensExport({ owner: DUMPEX_LINEA, tokens: [nullAddress]}), },
    optimism: { tvl: sumTokensExport({ owner: DUMPEX_OPTIMISM, tokens: [nullAddress]}), },
    polygon: { tvl: sumTokensExport({ owner: DUMPEX_POLYVON, tokens: [nullAddress]}), },
  };