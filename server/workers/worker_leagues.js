
const axios = require('axios')
const axiosRetry = require('axios-retry')


axiosRetry(axios, {
    retries: 5,
    retryCondition: () => {
        return true
    },
    retryDelay: () => 2000
})

const options = {
    headers: {
        'content-type': 'application/json'
    }
}

const getLeagueInfo = async (leagues, user_id) => {
    let leagues_detailed = []
    await Promise.all(leagues.filter(x => x.status === "in_season").map(async (league, index) => {
        let [rosters, users] = await Promise.all([

            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`, options),
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/users`, options)
        ])
        rosters?.data
            ?.sort((a, b) => b.settings.fpts - a.settings.fpts)
            ?.map((roster, index) => {
                roster['rank_points'] = index + 1
                return roster
            })

        const standings = (
            rosters?.data
                ?.sort((a, b) => b.settings.wins - a.settings.wins || a.settings.losses - b.settings.losses ||
                    b.settings.fpts - a.settings.fpts)
                ?.map((roster, index) => {
                    roster['rank'] = index + 1
                    return roster
                })
        )

        const userRoster = standings?.find(r => r.owner_id === user_id || r.co_owners?.includes(user_id))

        if (userRoster?.players?.length > 0) {
            leagues_detailed.push({
                ...league,
                index: index,
                rosters: rosters.data,
                users: users.data,
                userRoster: userRoster,
                standings: standings
            })
        }
    }))


    return leagues_detailed
}



module.exports = {
    getLeagueInfo: getLeagueInfo
}