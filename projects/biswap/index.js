const {getChainTvl} = require("../helper/getUniSubgraphTvl");
const {uniTvlExport} = require("../helper/calculateUniTvl");
const {sumTokens} = require("../helper/unwrapLPs");

const factory = "0x858e3312ed3a876947ea49d572a7c42de08af7ee";

const subgraphTvl = getChainTvl({
  "bsc": "https://api.thegraph.com/subgraphs/name/biswapcom/exchange5"
}, "pancakeFactories")('bsc')

const BSW = "0x965f527d9159dce6288a2219db51fc6eef120dd1"

const stakingPools = [
  // Staking pool
  "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739",

  // Other pools + inactive
  "0x13e9031133E901d5214fb4D593DF8ECc034c8237",
  "0xD4855892a3188DA76da0066b9e4918939511E67a",
  "0x9b9F3F1112E74765518cE93B1489c70F6db52bFf",
  "0x683963df7331c65Df8ACE6818651a7611bdc39E5",
  "0xBD09D5E5dcC904bbf8649af78d323eEfdf7b0D1D",
  "0x8b10E6959F2915f532fE142b9C53B167eEC42fF4",
  "0x7D621C9F70B3743CbAb15c22d781754FcD7c9589",
  "0x1F337dea1679730906F46A06fd6034054BD32970",
  "0x131010022654B57b0C39c918ef8313ce79Fa04B8",
  "0x6653c3c4CD2083fEbFf49A52F9a5ce4c30978A25",
  "0x44EeCE1e9ccbaa5Ad0b8C14192467Ab83BE0BA51",
  "0xA394dD5ADC4AAF41aa1f9CFf28158A6AF2823459",
  "0x6cBbA2f3BD677Da630aEd2311253713e8Ba1394D",
  "0xa3A911033af250f7013597A6AF6a719906Ac4444",
  "0xE42D17b1a734e04d2e0cB33234Ab074E21c175A7",
  "0xAa2b37d023Ffa244022A9aa60EeB351cc79FD4e5",
  "0x69C4c9cf979431DA6C4B4a2F3874E6378DFC8157",
  "0xE056FB8Ce6A3437530B1AfF799185A009b25990b",
  "0xf31F62A6Afb0546771a821e0F98FD187Ee7f7d4C",
  "0x2792Ccd3F02a22beBa49F28F3ab0B52dF18BD280",
  "0x109eAA8b5Ea469fb5aCe0647A93695D8DCD5e836",
]

async function staking(time, ethBlock, chainBlocks){
  const balances = {}
  await sumTokens(balances, stakingPools.map(pool=>[BSW, pool]), chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`)
  return balances
}

module.exports = {
  bsc: {
    staking,
    tvl: uniTvlExport(factory, "bsc")
  },
};