const { calculateUniTvl } = require('../helper/calculateUniTvl')
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const ETH_FACTORY = '0x4eef5746ED22A2fD368629C1852365bf5dcb79f1';
const MOONBEAM_FACTORY = '0x9504d0d43189d208459e15c7f643aac1abe3735d';

async function ethTvl(timestamp, block) {
  return calculateUniTvl(id=>id, block, 'ethereum', ETH_FACTORY, 12449394, false)
}

module.exports = {
    start: 1621220505, //2021-05-17 00:00:00 +UTC
    misrepresentedTokens: true,
    timetravel: true,
    ethereum: {
      tvl: ethTvl
    },
    moonbeam: {
        tvl: calculateUsdUniTvl(
            MOONBEAM_FACTORY,
            "moonbeam",
            "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c",
            [
                "0x6a2d262d56735dba19dd70682b39f6be9a931d98",
                "0x1a93b23281cc1cde4c4741353f3064709a16197d",
                "0x8006320739fc281da67ee62eb9b4ef8add5c903a",
                "0x6959027f7850adf4916ff5fdc898d958819e5375"
            ],
            "tether",
            6
        ),
    }
};