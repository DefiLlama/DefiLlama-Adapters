const { pool2 } = require('../helper/pool2');
const { staking } = require("../helper/staking");

module.exports = {
    cronos: {
        tvl: () => ({}), // tvl is 0 for ohm forks
        staking: staking('0x1A6aD4bac521a98556A4C0Da5946654c5DC7Ce0A', '0xb8df27c687c6af9afe845a2afad2d01e199f4878'),
        pool2: pool2("0xE25737b093626233877EC0777755c5c4081580be", "0xd7385f46FFb877d8c8Fe78E5f5a7c6b2F18C05A7")
    }
}