const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0x8c7290399cecbbbf31e471951cc4c2ce91f5073c" 
const vsq_token = "0x29f1e986fca02b7e54138c04c4f503dddd250558"
const stakingAddress = "0x2f3e9e54bd4513d1b49a6d915f9a83310638cfc2"
const treasuryTokens = [
    [ADDRESSES.polygon.DAI, false], //DAI
    ["0x2e1ad108ff1d8c782fcbbb89aad783ac49586756", false], //TUSD
    ["0xa3fa99a148fa48d14ed51d610c367c61876997f1", false], //MAI
    [ADDRESSES.polygon.FRAX, false], //FRAX
    ["0x692597b009d13c4049a947cab2239b7d6517875f", false], //UST
    ["0x27f8d03b3a2196956ed754badc28d73be8830a6e", false], //amDAI
    ["0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195", false], //gOHM
    ["0xa9536b9c75a9e0fae3b56a96ac8edf76abc91978", false], //PECO
    ["0x7fb27ee135db455de5ab1ccec66a24cbc82e712d", false], //GMI
    ["0x5Cf66CeAf7F6395642cD11b5929499229edEF531", true], //VSQ DAI LP
    ["0x41d18c810e70c643cc1326f232546abb620aae7e", true], //VSQ FRAX LP
    ["0xc2f4694ab1384e6bce1c8aa91b9a3e8cc1a6477e", true], //VSQ MAI LP
    ["0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171", false], //Curve am3CRV
   ]
module.exports = ohmTvl(treasury, treasuryTokens, "polygon", stakingAddress, vsq_token, undefined, undefined, true)