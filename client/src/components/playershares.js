import React, { useState, useEffect, useRef } from "react"
const Search = React.lazy(() => import('./search'));
const PlayerLeagues = React.lazy(() => import('./playerLeagues'));
const PlayerStartBench = React.lazy(() => import('./playerStartBench'))

const PlayerShares = (props) => {
    const [playershares, setPlayershares] = useState([])
    const [stateWeeklyRankings, SetStateWeeklyRankings] = useState([]);
    const [searched, setSearched] = useState('')
    const [leaguesVisible, setLeaguesVisible] = useState([])
    const [page, setPage] = useState(1)
    const [filterTeam, setFilterTeam] = useState('All')
    const [displayRankings, setDispayRankings] = useState(false)
    const rowRef = useRef(null)

    const toggleLeagues = (player_id) => {
        let lv = leaguesVisible;
        if (lv.includes(player_id)) {
            lv = lv.filter(x => x !== player_id)
        } else {
            lv.push(player_id)
        }
        setLeaguesVisible([...lv])
    }

    useEffect(() => {
        setPlayershares(props.player_shares.sort((a, b) => b.leagues_owned.length - a.leagues_owned.length))
        const weekly_rankings = Object.keys(props.weekly_rankings).map(fp_id => {
            return {
                ...props.weekly_rankings[fp_id]
            }
        })
        SetStateWeeklyRankings(weekly_rankings)
    }, [props])

    useEffect(() => {
        setPage(1)
    }, [searched, props.player_shares])

    useEffect(() => {
        window.scrollTo({
            top: rowRef.current?.offsetTop,
            left: 0,
            behavior: 'auto'
        })
    }, [page])

    let playershares_display = displayRankings ? stateWeeklyRankings : playershares
    playershares_display = playershares_display.filter(x =>
        (filterTeam === 'All' || props.allplayers[x.id]?.team === filterTeam) &&
        (searched.trim().length === 0 || props.allplayers[x.id]?.full_name === searched)
    )

    const header = displayRankings ? (
        <>
            <tr className="main_header double">
                <th colSpan={3} rowSpan={2}>Player</th>
                <th colSpan={4}>Rank</th>
                <th colSpan={2} rowSpan={2}>Opp</th>
                <th colSpan={1} rowSpan={2}>Start</th>
                <th colSpan={1} rowSpan={2}>Bench</th>
            </tr>
            <tr className="main_header double">
                <th colSpan={1}>OVR</th>
                <th colSpan={1}>Min</th>
                <th colSpan={1}>Max</th>
                <th colSpan={1}>Pos</th>
            </tr>
        </>
    ) : (
        <tr className="main_header single">
            <th colSpan={5}>
                Name
            </th>
            <th colSpan={1}>
                #
            </th>
            <th>
                W
            </th>
            <th>
                L
            </th>
            <th colSpan={2}>
                W%
            </th>
            <th colSpan={3}>
                PF
            </th>
            <th colSpan={3}>
                PA
            </th>
        </tr>
    )

    const display = displayRankings ? (
        <>
            {
                playershares_display
                    .slice((page - 1) * 25, ((page - 1) * 25) + 25).map((player, index) =>
                        <tbody
                            key={`${player.id}_${index}`}
                            className={leaguesVisible.includes(player.id) ? 'active' : null}
                        >
                            <tr>
                                <td colSpan={11}>
                                    <table className={`table${1}`}>
                                        <tbody>
                                            <tr
                                                ref={index === 0 ? rowRef : null}
                                                className={leaguesVisible.includes(player.id) ? 'main_row active clickable' : 'main_row clickable'}
                                                onClick={() => toggleLeagues(player.id)}
                                            >
                                                <td colSpan={3} className={'left'}>
                                                    <p>
                                                        {
                                                            props.avatar(player.id, props.allplayers[player.id]?.full_name, 'player')
                                                        }
                                                        {props.allplayers[player.id]?.position}&nbsp;
                                                        {props.allplayers[player.id]?.full_name || player.player_name}&nbsp;
                                                        {props.allplayers[player.id]?.team}
                                                    </p>
                                                </td>
                                                <td colSpan={1}>{player.rank_ecr}</td>
                                                <td colSpan={1}>{player.rank_min}</td>
                                                <td colSpan={1}>{player.rank_max}</td>
                                                <td colSpan={1}>{player.pos_rank}</td>
                                                <td colSpan={2}>{player.player_opponent}</td>
                                                <td colSpan={1}>
                                                    {
                                                        playershares.find(ps => ps.id === player.id)?.leagues_owned.filter(lo => lo.status === 'Starter').length
                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        playershares.find(ps => ps.id === player.id)?.leagues_owned.filter(lo => lo.status !== 'Starter').length
                                                    }
                                                </td>
                                            </tr>
                                            {
                                                !leaguesVisible.includes(player.id) ? null :
                                                    <tr>
                                                        <td colSpan={11}>
                                                            <React.Suspense fallback={
                                                                <div className='logo_wrapper'>
                                                                    <div className='z one'>Z</div>
                                                                    <div className='z two'>Z</div>
                                                                    <div className='z three'>Z</div>
                                                                </div>}>
                                                                <PlayerStartBench
                                                                    type={2}
                                                                    leagues_starting={playershares.find(ps => ps.id === player.id)?.leagues_owned.filter(lo => lo.status === 'Starter')}
                                                                    leagues_benched={playershares.find(ps => ps.id === player.id)?.leagues_owned.filter(lo => lo.status !== 'Starter')}
                                                                    avatar={props.avatar}
                                                                    user_id={props.user_id}
                                                                />
                                                            </React.Suspense>
                                                        </td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    )
            }
            {
                (((page - 1) * 25) + 25) < playershares_display.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={11}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </>
    ) : (
        <>
            {
                playershares_display
                    .slice((page - 1) * 25, ((page - 1) * 25) + 25).map((player, index) =>
                        <tbody
                            key={`${player.id}_${index}`}
                            className={leaguesVisible.includes(player.id) ? 'active' : null}
                        >
                            <tr>
                                <td colSpan={16}>
                                    <table className={`table${1}`}>
                                        <tbody>
                                            <tr
                                                ref={index === 0 ? rowRef : null}
                                                className={leaguesVisible.includes(player.id) ? 'main_row active clickable' : 'main_row clickable'}
                                                onClick={() => toggleLeagues(player.id)}
                                            >
                                                <td colSpan={5} className={'left'}>
                                                    <p>
                                                        {
                                                            props.avatar(player.id, props.allplayers[player.id].full_name, 'player')
                                                        }
                                                        {props.allplayers[player.id].full_name} {props.allplayers[player.id].team}
                                                    </p>
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        player.leagues_owned.length
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        player.leagues_owned.reduce((acc, cur) => acc + cur.wins, 0)
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        player.leagues_owned.reduce((acc, cur) => acc + cur.losses, 0)
                                                    }
                                                </td>
                                                <td colSpan={2}>
                                                    <em>
                                                        {
                                                            (player.leagues_owned.reduce((acc, cur) => acc + cur.wins, 0) /
                                                                player.leagues_owned.reduce((acc, cur) => acc + cur.losses + cur.wins, 0)).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 })
                                                        }
                                                    </em>
                                                </td>
                                                <td colSpan={3}>
                                                    {
                                                        player.leagues_owned.reduce((acc, cur) => acc + cur.fpts, 0).toLocaleString("en-US")
                                                    }
                                                </td>
                                                <td colSpan={3}>
                                                    {
                                                        player.leagues_owned.reduce((acc, cur) => acc + cur.fpts_against, 0).toLocaleString("en-US")
                                                    }
                                                </td>
                                            </tr>
                                            {
                                                !leaguesVisible.includes(player.id) ? null :
                                                    <tr>
                                                        <td colSpan={16}>
                                                            <React.Suspense fallback={
                                                                <div className='logo_wrapper'>
                                                                    <div className='z one'>Z</div>
                                                                    <div className='z two'>Z</div>
                                                                    <div className='z three'>Z</div>
                                                                </div>}>
                                                                <PlayerLeagues
                                                                    type={2}
                                                                    leagues_owned={player.leagues_owned}
                                                                    leagues_taken={player.leagues_taken}
                                                                    leagues_available={player.leagues_available}
                                                                    avatar={props.avatar}
                                                                    user_id={props.user_id}
                                                                />
                                                            </React.Suspense>
                                                        </td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                        </tbody>
                    )
            }
            {
                (((page - 1) * 25) + 25) < playershares_display.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={16}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </>
    )

    const nfl_teams = [
        'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
        'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA', 'MIN',
        'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
    ]

    return <>
        <button
            className={displayRankings ? 'active clickable' : 'clickable'}
            onClick={() => setDispayRankings(true)}
        >
            Rankings/Projections
        </button>
        <button
            className={!displayRankings ? 'active clickable' : 'clickable'}
            onClick={() => setDispayRankings(false)}
        >
            Ownership
        </button>
        <span className="team">
            <label>
                Team
            </label>
            <select onChange={(e) => setFilterTeam(e.target.value)}>
                <option>All</option>
                {nfl_teams.map(team =>
                    <React.Fragment key={team}>
                        <option>{team}</option>
                    </React.Fragment>
                )}
            </select>
        </span>
        <React.Suspense fallback={<>...</>}>
            <Search
                list={playershares.map(player => props.allplayers[player.id]?.full_name)}
                placeholder={'Search Players'}
                sendSearched={(data) => setSearched(data)}
            />
        </React.Suspense>
        <div className="page_numbers_wrapper">
            <ol className="page_numbers">
                {Array.from(Array(Math.ceil(playershares_display.length / 25)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => setPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
        </div>
        <table className="main">
            <thead className="main">
                {header}
            </thead>
            {
                display
            }
        </table>
    </>
}

export default React.memo(PlayerShares);