const ADDRESSES = require('../helper/coreAssets.json')
const {ohmTvl} = require("../helper/ohm");

const sus = "0x5b5Fe1238aca91C65683aCd7f9D9Bf922e271EAA";
const stakingContract = "";

const treasury = "0x7310855e0Aa8B110925fdE0100b01c62984d2a3C";
const treasuryTokens = [
    [ADDRESSES.cronos.USDC, false], // USDC
    ["0xAE182Db2F7897D7678c5099C1e52A1c802580827", true], // SUS-USDC CRONA LPS
]