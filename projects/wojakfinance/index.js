
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { stakings } = require('../helper/staking')

const MasterChefContract = "0x065AAE6127D2369C85fE3086b6707Ac5dBe8210a";
const WojkPoolContract = "0xDF21058099e69D3635005339721C4826c4c47F8A";
const WOJK = "0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD";
module.exports = {
    methodology: `Uses factory(0xc7c86B4f940Ff1C13c736b697e3FbA5a6Bc979F9) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    dogechain: {
        tvl: calculateUsdUniTvl(
            "0xc7c86B4f940Ff1C13c736b697e3FbA5a6Bc979F9",
            "dogechain",
            "0x765277EebeCA2e31912C9946eAe1021199B39C61",
            [
                "0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD",
                "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101",
                "0x765277EebeCA2e31912C9946eAe1021199B39C61",
                "0x332730a4F6E03D9C55829435f10360E13cfA41Ff",
                "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D",
                "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
                "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
                "0x7b4328c127b85369d9f82ca0503b000d09cf9180",
                "0xa649325aa7c5093d12d6f98eb4378deae68ce23f",
            ],
            "usd-coin"
        ),
        staking: stakings([MasterChefContract, WojkPoolContract], WOJK, "dogechain"),
    }
};


