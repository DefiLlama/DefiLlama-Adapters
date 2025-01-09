const { sumTokens } = require("../helper/chain/fuel");

module.exports = {
    fuel: {
        tvl: (api) =>
            sumTokens({
                api, owners: [
                    '0xfe2c524ad8e088f33d232a45dbea43e792861640b71aa1814b30506bf8430ee5',
                    '0xdafe498b31f24ea5577055e86bf77e96bcba2c39a7ae47abaa819c303a45a352',
                    '0x81e83f73530c262b0dbf5414649a875c48a48144de3c08ff68cb9d54b36f2eaa',
                ]
            })
    }
}