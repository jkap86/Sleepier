const express = require('express')
const path = require('path')
const app = express()
const compression = require('compression')
const cors = require('cors')
const axios = require('axios')
const weekly_rankings = require('./workers/worker_weeklyRankings')
const leagues = require('./workers/worker_leagues')
const syncLeague = require('./workers/worker_leagueSync')

app.use(compression())
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));


const dailySync = async () => {
    const allplayers = await axios.get('https://api.sleeper.app/v1/players/nfl', { timeout: 3000 })
    app.set('allplayers', allplayers.data)
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
    const week = app.get('week')
    if (week !== state.data.week) {
        app.set('week', state.data.week)
        app.set('stats', [])
    }

}
dailySync()
setInterval(dailySync, 1000 * 60 * 60 * 24)

const syncStats = async () => {
    const date = new Date();
    const day = date.getDay()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const week = app.get('week')
    if (day === 0 && week >= 1 && week <= 18) {
        const stats = await axios.get(`https://api.sleeper.com/stats/nfl/2022/${week}?season_type=regular`)
        app.set('stats', stats.data)
        console.log(`Week ${week} stats synced`)
    } else if (hour === 3 && minute < 30 && week >= 1 && week <= 18) {
        const stats = await axios.get(`https://api.sleeper.com/stats/nfl/2022/${week}?season_type=regular`)
        app.set('stats', stats.data)
        console.log(`Week ${week} stats synced`)
    }

}
const getStats = async () => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
    const week = state.data.week
    if (week >= 1 && week <= 18) {
        const stats = await axios.get(`https://api.sleeper.com/stats/nfl/2022/${week}?season_type=regular`)
        app.set('stats', stats.data)
    }
}
getStats()
setInterval(syncStats, 1000 * 60 * 30)

app.get('/allplayers', (req, res) => {
    const allplayers = app.get('allplayers')
    res.send(allplayers)
})

app.get('/stats', (req, res) => {
    const stats = app.get('stats')
    res.send(stats)
})

app.get('/weeklyrankings', weekly_rankings)

app.get('/user', async (req, res) => {
    const username = req.query.username
    try {
        const user = await axios.get(`https://api.sleeper.app/v1/user/${username}`)
        res.send(user.data)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

app.get('/leagues', leagues)

app.get('/syncleague', syncLeague)

app.get('*', async (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});