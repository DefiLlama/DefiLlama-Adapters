const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const immo = "0xE685d21b7B0FC7A248a6A8E03b8Db22d013Aa2eE";
const stakingContract = "0xA02F4e8dE9A226E8f2F2fe27B9b207fC85CFEED2";
const treasury = "0xe2adCd126b4275cD75e72Ff7ddC8cF7e43fc13D4";
const tokens = [
    [ADDRESSES.celo.mcUSD, false], // CUSD
    ["0x7d63809EBF83EF54c7CE8dEd3591D4E8Fc2102eE", true] // IMMO-CUSD
]

module.exports =ohmTvl(treasury, tokens, "celo", stakingContract, immo)
