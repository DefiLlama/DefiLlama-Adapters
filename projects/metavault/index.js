const {ohmTvl} = require("../helper/ohm");

const treasury = "0x7bE9BbB7373B675aBd25fA6d58085C8dACF6cc4a";

const treasuryTokens = [
    ["0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", false], // DAI
    ["0x738F57002c3Ff4C3b418c2d37024996608f8E281", true], // MVD-DAI LP
];

const stakingAddress = "0x6eA8de8f643ba65D8be39bd8D3B72f6DaAda7E77";
const stakingToken = "0x27746007e821aeec6F9C65CBFda04870c236346c";

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "fantom", stakingAddress, stakingToken)
}
