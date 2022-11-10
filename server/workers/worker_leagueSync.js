const express = require('express')
const router = express.Router()
const axios = require('axios')
const axiosRetry = require('axios-retry')

const options = {
    headers: {
        'content-type': 'application/json'
    }
}

const syncLeague = async (league_id, user_id) => {
    const [league, rosters, users] = await Promise.all([
        await axios.get(`https://api.sleeper.app/v1/league/${league_id}`, options),
        await axios.get(`https://api.sleeper.app/v1/league/${league_id}/rosters`, options),
        await axios.get(`https://api.sleeper.app/v1/league/${league_id}/users`, options)
    ])
    rosters.data
        .sort((a, b) => b.settings.fpts - a.settings.fpts)
        .map((roster, index) => {
            roster['rank_points'] = index + 1
            return roster
        })

    const standings = (
        rosters.data
            .sort((a, b) => b.settings.wins - a.settings.wins || a.settings.losses - b.settings.losses ||
                b.settings.fpts - a.settings.fpts)
            .map((roster, index) => {
                roster['rank'] = index + 1
                return roster
            })
    )

    const userRoster = standings.find(r => r.owner_id === user_id || r.co_owners?.includes(user_id))

    if (userRoster?.players) {
        return {
            ...league.data,
            rosters: rosters.data,
            users: users.data,
            userRoster: userRoster,
            standings: standings
        }
    }

}

router.get('/syncleague', async (req, res) => {
    const league_id = req.query.league_id
    const user_id = req.query.user_id
    const league = await syncLeague(league_id, user_id)
    res.send(league)
})

module.exports = router