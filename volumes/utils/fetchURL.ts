import axios from "axios"
const retry = require("async-retry")


export default async function fetchURL(url: string) {
    return retry(async () => await axios.get(url), {
        retries: 3
    })
}