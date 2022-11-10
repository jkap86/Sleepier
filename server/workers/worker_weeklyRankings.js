const express = require('express')
const app = express()
const router = express.Router()
const axios = require('axios')
const cheerio = require('cheerio')

const options = {
    headers: {
        'content-type': 'application/json'
    }
}

const getWeeklyRankings = async () => {
    const html_sf = await axios.get('https://www.fantasypros.com/nfl/rankings/ppr-superflex.php')

    let script = []
    let $ = cheerio.load(html_sf.data)
    const header = $('.rankings-page__heading').text()
    const week = header.match(/(?<=Week )[0-9]+(?= \()/g)
    $('script').each((i, elem) => {
        if ($(elem).text().includes("var ecrData")) {
            script.push({
                index: i,
                text: $(elem).text()
            })
        }
    })


    let rankings = script[0].text.substring(
        script[0].text.indexOf('[') + 1,
        script[0].text.indexOf(']')
    )
        .replace(/},{/g, "}-----{")
        .split('-----')

    let rankings_parsed = rankings.map(rank => {
        let parsed = JSON.parse(rank)
        parsed['week'] = week[0]
        return parsed
    })


    return rankings_parsed

}

router.get('/weeklyrankings', async (req, res) => {
    const weekly_rankings = await getWeeklyRankings()
    res.send(weekly_rankings)
})

module.exports = router;

