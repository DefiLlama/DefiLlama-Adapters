const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0x0c01089AEdc45Ab0F43467CCeCA6B4d3E4170bEa',
        '0x2864DE013415B6c2C7A96333183B20f0F9cC7532',
        '0x8550E644D74536f1DF38B17D5F69aa1BFe28aE86',
        '0xd03be958e6b8da2d28ac8231a2291d6e4f0a7ea7',
        '0xd6e0F7dA4480b3AD7A2C8b31bc5a19325355CA15',
        '0xe5d7ccc5fc3b3216c4dff3a59442f1d83038468c',
        '0xe83a48cae4d7120e8ba1c2e0409568ffba532e87',
        '0xf0bc8FdDB1F358cEf470D63F96aE65B1D7914953',
    ],
  },
  bitcoin: {
    owners: [
        '1JtAupan5MSPXxSsWFiwA79bY9LD2Ga1je',
        '3E8BTrBB7jxAemyUqSnN4YFLMC22cShZJZ',
        '3GoBetHTvfnaRNQbR4yy5YNUjX4d8mTQKK',
        'bc1q09j44e0xxxusj3zsan20x7tuvtumxfv9smlq27t0nwp57gxf7htqq6m9lj',
        'bc1q0uffd8egas4w87dxq998ttfl6j3jtw6k7cafce9v4mvr5qc9tvfq9czqk9',
        'bc1q33m8td986p3vcnap9zqpx3d8v8zujtkvqacsya5xfvf945vmvxzqth4h4t',
        'bc1q3yn06lfl8ayjukya52ksff0uaveurfc8lm3ftdgu8ywvwanx8lqswj7w9u',
        'bc1q4sv2fxlp6w08wkq8ywmughxkm7n75d2fmrgnmvwun6rhepyknjxqm99v4x',
        'bc1q7fww9657ts2au45wh0ed39rjze6ja93z0498z4j89pqjky266wzs0sz8ka',
        'bc1q9pnwfyd4jtkulyk4w057wsdjhykaw6fftw06k2cn2m3y7jlsfe2qvxvm8e',
        'bc1qa8may4g0yzezjyesqcq0mwggy5wwzl0yhs0a8tk9ucej5qg6ujfqscv2jq',
        'bc1qgkx4ee8ac3as5y4ddhw6uedyk9adsywdzgc0fzxv304lcrh4qs9sn96agt',
        'bc1qku6z53kuyaj9r898kj6esqnwz7wke82mwgw43vhu33ld7sx3200s2u9p9x',
        'bc1ql0p3klhr2d8z07ja3t5d5dnxrenhp4gcjeszxpfflr08zaqqx5zqpkeqnl',
        'bc1qnerwvz93pcj653r5yd4hnd2d7np2drhdhyruj7qdvl3psc5wnf0q6x9me4',
        'bc1qs9ut74nue7vjknz2eqxegmtuzqhjzx9y8tzjymvlg05v8a5ffr5qz402cx',
        'bc1qsk6h7d2l7e7r2a8krlxjn6wdnhhszyrtzcugdsfa5zz4syajzl5spd52h5',
        'bc1qsmqvkwrsy5xw2hm885l5fv7s2hxzauz5fn9jayfmd86305wehrts2lztgs',
        'bc1qtlen0nuvln3aqcn2r3nljshdmzakq7z5z4rexpk23mj8u8lmc8ysc29jct',
        'bc1qzdt5z4f46jak59jku5jmvv3f2ru20htqs7jhy0whazgd5v4626eq4vkxqz',
        'bc1qzu4lnzfpskwsvnyvzud9a7ru4d2ft7whqvl5d3kskxxhgeupnjjquzvt97',
    ]
  },
  ripple: {
    owners: [
        'r9WGxuEbUSh3ziYt34mBRViPbqVxZmwsu3',
        'rGU8q9qNCCQG2eMgJpLJJ1YFF5JAbntqau',
        'rGq74nAmw1ARejUNLYEBGxiQBaoNtryEe9',
        'rJRarS792K6LTqHsFkZGzM1Ue6G8jZ2AfK',
        'rNWWbLxbZRKd51NNZCEjoSNovrrx7yiPyt',
        'rsYFhEk4uFvwvvKJomHL7KhdF29r2sw9KD'
    ]
  }
}

module.exports = cexExports(config)