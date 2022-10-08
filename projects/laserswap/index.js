const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  methodology: `Uses factory(0x23c7FA9A9f81B322684F25b8079e22C37e00b46b) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  thundercore: {
    tvl: calculateUsdUniTvl(
      "0x23c7FA9A9f81B322684F25b8079e22C37e00b46b",
      "thundercore",
      "0x413cEFeA29F2d07B8F2acFA69d92466B9535f717",
      [
        "0x4f3C8E20942461e2c3Bdd8311AC57B0c222f2b82",
        "0x22e89898A04eaf43379BeB70bf4E38b1faf8A31e",
        "0x6576Bb918709906DcbFDCeae4bB1e6df7C8a1077",
        "0xBEB0131D95AC3F03fd15894D0aDE5DBf7451d171",
        "0x47fe33d321EEF4719FdFf38EA72B1dFC7f0cdf10",
        "0x6E690DaC861fE7441770f84146F263d1CFBE909C",
        "0xfE146D5710015d4075355fb7bE8d133346EC63c2",
        "0x8EF1A1E0671Aa44852f4d87105eF482470bB3e69",
        "0xFd6Ec3E37F112bD30BbD726E7b0E73000CC2B98d",
        "0x0212b1f75503413b01a98158434c4570fb6e808c",
        "0x1F489E0282cFA883A4224C91309bC4D4c062ed93",
        "0xD441cD6eCfA027721B4d9ea5D9a6A9649ad8b3dA",
        "0xfF99e917cF1E081A4e52836bbE8DF610cbAb9DD7",
        "0x18fB0A62f207A2a082cA60aA78F47a1af4985190",
      ],
      "thunder-token"
    ),
  },
}
