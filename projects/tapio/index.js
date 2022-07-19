const axios = require('axios');

async function fetch(){
    return (await axios.get('https://api.taigaprotocol.io/protocol/tapio/tvl')).data;
}

module.exports = {
    fetch
}