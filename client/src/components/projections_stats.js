
export const match_weekly_rankings = async (weekly_rankings, allplayers) => {
    const week = weekly_rankings.find(w_r => w_r.week).week
    const teams_playing = Array.from(new Set(weekly_rankings.map(w_r => w_r.player_team_id)))
    weekly_rankings.map(fp_id => {
        const searchName = (
            fp_id.player_name
                .split(' ')
                .filter(x => !['V', 'III', 'II', 'Sr.', 'Jr.'].includes(x))
                .join('')
                .replace("'", "")
                .replace('-', '')
                .replace('.', '')
                .toLowerCase()
                .replace(/[^a-zA-Z ]/g, "")
                .trim()
        )
        const match_id = Object.keys(allplayers).find(x =>
            (
                allplayers[x].yahoo_id === parseInt(fp_id.player_yahoo_id) &&
                allplayers[x].search_full_name.replace(/[^a-zA-Z ]/g, "").trim() === searchName
            )
            ||
            (
                (
                    (allplayers[x].position === fp_id.player_position_id ||
                        ['RB', 'TE'].includes(fp_id.player_position_id) && allplayers[x].position === 'FB')
                )
                &&
                (allplayers[x].search_full_name.trim() === searchName)
                &&
                (
                    allplayers[x].team === fp_id.player_team_id ||
                    allplayers[x].team?.slice(0, 2) === fp_id.player_team_id.slice(0, 2)
                )
            )
        )
        if (match_id) {
            allplayers[match_id] = {
                ...allplayers[match_id],
                ...fp_id
            }
        } else {
            console.log(`${fp_id.player_name} NOT MATCHED!!!`)
        }
    })
    Object.keys(allplayers).filter(id => !allplayers[id].rank_ecr).map(id => {
        allplayers[id].rank_ecr = !allplayers[id].team || teams_playing.includes(allplayers[id].team) ? 999 : 1000
        allplayers[id].week = week
    })
    return (allplayers)
}

export const getNewRank = (rankings, prevRank, newRank, player_id, playerToIncrement, playerToIncrementRank) => {
    let incrementedRank = playerToIncrementRank
    if (playerToIncrement === player_id) {
        incrementedRank = newRank
    } else {
        if (rankings[playerToIncrement].rank_ecr > prevRank) {
            incrementedRank = parseInt(rankings[playerToIncrement].rank_ecr) - 1
        }
        if (incrementedRank >= newRank) {
            incrementedRank = parseInt(incrementedRank) + 1
        }
    }
    return incrementedRank
}

export const getLineupCheck = (roster_positions, roster, allplayers, includeTaxi, rankMargin, stateStats) => {
    const teams_already_played = Array.from(new Set(stateStats.map(x => x.team)))

    const position_map = {
        'QB': ['QB'],
        'RB': ['RB', 'FB'],
        'WR': ['WR'],
        'TE': ['TE'],
        'FLEX': ['RB', 'FB', 'WR', 'TE'],
        'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
        'WRRB_FLEX': ['RB', 'FB', 'WR'],
        'REC_FLEX': ['WR', 'TE']
    }

    const starting_slots = roster_positions.filter(x => Object.keys(position_map).includes(x))

    let player_ranks = roster.players.filter(x =>
        (includeTaxi > 0 || !roster.taxi?.includes(x)) &&
        !teams_already_played.includes(allplayers[x]?.team)
    ).map(player => {
        let rank = (allplayers[player]?.rank_ecr || 999)
        if (!roster.starters?.includes(player)) {
            rank = (rank + rankMargin)

        } else {
            rank = allplayers[player]?.rank_ecr || 999
        }

        return {
            id: player,
            rank: parseInt(rank)
        }
    })

    let optimal_lineup = []
    starting_slots.map((slot, index) => {
        const slot_options = player_ranks
            .filter(p => position_map[slot].includes(allplayers[p.id]?.position))
            .sort((a, b) => a.rank - b.rank)

        const optimal_player = slot_options[0]?.id
        player_ranks = player_ranks.filter(p => p.id !== optimal_player)
        optimal_lineup.push(optimal_player)
    })

    let lineup_check = []
    starting_slots.map((slot, index) => {
        const cur_id = roster.starters[index]
        const subs_all = roster.players
            .filter(p =>
                !roster.starters.includes(p) &&
                !roster.taxi?.includes(p) &&
                position_map[slot].includes(allplayers[p]?.position)
            )
        const subs = subs_all.filter(p =>
            allplayers[p]?.rank_ecr < (allplayers[cur_id]?.rank_ecr - rankMargin)
        )
        const subs_taxi = (includeTaxi < 0 ? [] :
            roster.taxi?.filter(p =>
                position_map[slot].includes(allplayers[p]?.position) &&
                allplayers[p]?.rank_ecr < (allplayers[cur_id]?.rank_ecr - rankMargin)
            ) || []
        )

        const isInOptimal = optimal_lineup.includes(cur_id)


        const slot_abbrev = slot
            .replace('SUPER_FLEX', 'SF')
            .replace('FLEX', 'W/R/T')
            .replace('WRRB_FLEX', 'W/R')
            .replace('REC_FLEX', 'W/T')

        lineup_check.push({
            index: index,
            slot: slot,
            slot_abbrev: slot_abbrev,
            cur_id: cur_id,
            cur_rank: allplayers[cur_id]?.rank_ecr,
            subs: subs.filter(x => optimal_lineup.includes(x)),
            subs_taxi: subs_taxi.filter(x => optimal_lineup.includes(x)),
            isInOptimal: isInOptimal,
            optimal_lineup: optimal_lineup
        })
    })

    lineup_check = lineup_check.map(slot => {
        if (!slot.isInOptimal && !(slot.subs.length > 0) && !(slot.subs_taxi.length > 0)) {
            const swaps = optimal_lineup
                .filter(p =>
                    position_map[slot.slot].includes(allplayers[p]?.position) &&
                    slot.cur_rank > (allplayers[p]?.rank_ecr) &&
                    slot.slot !== lineup_check.find(x => x.cur_id === p)?.slot
                )
            slot.swaps = swaps
        }
        return slot
    })
    return lineup_check
}

export const getStartedOver = (player_id, roster, roster_positions, allplayers, player_rank) => {
    const position_map = {
        'QB': ['QB'],
        'RB': ['RB', 'FB'],
        'WR': ['WR'],
        'TE': ['TE'],
        'FLEX': ['RB', 'FB', 'WR', 'TE'],
        'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
        'WRRB_FLEX': ['RB', 'FB', 'WR'],
        'REC_FLEX': ['WR', 'TE']
    }

    const slot = roster_positions[roster.starters.indexOf(player_id)]

    const subs = roster.players.filter(p =>
        !roster.starters.includes(p) &&
        position_map[slot].includes(allplayers[p].position) &&
        allplayers[p]?.rank_ecr < player_rank
    )

    return subs.length > 0 ? subs : null
}

export const getBenchedOver = (player_id, roster, roster_positions, allplayers, player_rank) => {
    const position_map = {
        'QB': ['QB'],
        'RB': ['RB', 'FB'],
        'WR': ['WR'],
        'TE': ['TE'],
        'FLEX': ['RB', 'FB', 'WR', 'TE'],
        'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
        'WRRB_FLEX': ['RB', 'FB', 'WR'],
        'REC_FLEX': ['WR', 'TE']
    }

    const slots = roster_positions.map((slot, index) => {
        const rank = allplayers[roster.starters[index]]
        const rank_ovr = rank?.rank_ecr
        const rank_pos = rank?.pos_rank
        return {
            slot: slot.replace('SUPER_FLEX', 'SF').replace('FLEX', 'WRT'),
            starter: roster.starters[index],
            rank: rank_ovr,
            rank_pos: rank_pos
        }
    }).filter((slot, index) => {
        return (
            position_map[slot.slot]?.includes(allplayers[player_id]?.position) &&
            slot.rank > player_rank
        )
    })

    return slots.length > 0 ? slots : null

}