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


const options = {
    headers: {
        'content-type': 'application/json'
    }
}

const dailySync = async () => {
    const allplayers = await axios.get('https://api.sleeper.app/v1/players/nfl', options)
    app.set('allplayers', allplayers.data)
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl', options)
    const week = app.get('week')
    if (week !== state.data.week) {
        app.set('week', state.data.week)
        app.set('stats', [])
        getProjections(state.data.week)
    }
}
dailySync()
setInterval(dailySync, 1000 * 60 * 60 * 24)

const getProjections = async (week) => {
    const status = {
        'Questionable': 'Q',
        'Out': 'O',
        'IR': 'IR',
        'Doubtful': 'D',
        'Sus': 'SUS'
    }
    if (week >= 1 && week <= 18) {
        const allplayers = app.get('allplayers')
        const projections = await axios.get(`https://api.sleeper.com/projections/nfl/2022/${week}?season_type=regular&position[]=FLEX&position[]=QB&position[]=RB&position[]=SUPER_FLEX&position[]=TE&position[]=WR&order_by=ppr`, options)
        projections.data.map(proj => {
            allplayers[proj.player_id] = {
                ...allplayers[proj.player_id],
                injury: status[proj.player?.injury_status]
            }
        })
        app.set('allplayers', allplayers)
    }
}

setInterval(() => {
    getProjections(app.get('week'))
}, 1000 * 60 * 15)


const syncStats = async () => {
    const date = new Date();
    const day = date.getDay()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const week = app.get('week')
    if (day === 0 && week >= 1 && week <= 18) {
        const stats = await axios.get(`https://api.sleeper.com/stats/nfl/2022/${week}?season_type=regular`, options)
        app.set('stats', stats.data)
        console.log(`Week ${week} stats synced`)
    } else if (hour === 3 && minute < 30 && week >= 1 && week <= 18) {
        const stats = await axios.get(`https://api.sleeper.com/stats/nfl/2022/${week}?season_type=regular`, options)
        app.set('stats', stats.data)
        console.log(`Week ${week} stats synced`)
    }

}


const getStats = async () => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl', options)
    const week = state.data.week
    if (week >= 1 && week <= 18) {
        const stats = await axios.get(`https://api.sleeper.com/stats/nfl/2022/${week}?season_type=regular`, options)
        app.set('stats', stats.data)
    }
}

const getSchedule = async () => {
    const schedule = await axios.get(`https://api.sportsdata.io/v3/nfl/scores/json/Schedules/%7B2022%7D?key=d5d541b8c8b14262b069837ff8110635`, options)
    app.set('schedule', schedule.data)
}
getSchedule()

app.get('/allplayers', (req, res) => {
    const allplayers = app.get('allplayers')
    res.send(allplayers)
})

app.get('/schedule', async (req, res) => {
    const schedule = app.get('schedule')
    res.send(schedule)
})

app.get('/weeklyrankings', weekly_rankings)

app.get('/user', async (req, res) => {
    const username = req.query.username
    try {
        const user = await axios.get(`https://api.sleeper.app/v1/user/${username}`, options)
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