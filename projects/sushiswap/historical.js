const HTMLParser = require("node-html-parser");
const axios = require("axios");

const analytics = [
    ["avalanche", ""],
    ["harmony", "https://analytics-harmony.sushi.com/"],
    ["polygon", "https://analytics-polygon.sushi.com/"],
    ["fantom", "https://analytics-ftm.sushi.com/"],
]

async function chainTvl(url) {
    const html = await axios.get("https://analytics-harmony.sushi.com/")
    const data = HTMLParser.parse(html.data).querySelector("#__NEXT_DATA__")
    const dayDatas = Object.entries(JSON.parse(data.innerHTML).props.pageProps.initialApolloState).filter(([name]) => name.startsWith("DayData"))
}