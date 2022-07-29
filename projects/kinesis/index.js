/*==================================================
  Modules
  ==================================================*/
  const axios = require("axios");
  const sdk = require("@defillama/sdk");
  const BigNumber = require("bignumber.js");

  const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
  // const {
  //   transformEvmosAddress
  // } = require("../helper/portedTokens");
  const { getChainTransform} = require("../helper/portedTokens")



/*** Arbitrum Addresses ***/
const poolAddresses_evmos = [
    //NomadBasePoolAddress
    "0x49b97224655AaD13832296b8f6185231AFB8aaCc",
    //CelerBasePool
    "0xbBD5a7AE45a484BD8dAbdfeeeb33E4b859D2c95C",
];

const madUSDC = "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82"
const madUSDT = "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e"
const ceUSDC = "0xe46910336479F254723710D57e7b683F3315b22B"
const ceUSDT = "0xb72A7567847abA28A2819B855D7fE679D4f59846"
const FRAX = "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8"


async function tvl(timestamp, chainBlocks) {
    const balances = {};
    const transformAddress = await getChainTransform("evmos");
    await sumTokensAndLPsSharedOwners(
        balances,
        [
        [madUSDC, false],
        [madUSDT, false],
        [ceUSDC, false],
        [ceUSDT, false],
        [FRAX, false],
        ],
        poolAddresses_evmos,
        chainBlocks["evmos"],
        "evmos",
        transformAddress
    );
    return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    misrepresentedTokens: true,
    evmos: {
      tvl
    },
    methodology:
      "Counts as TVL all the Assets deposited on EVMOS through different Pool Contracts",
};