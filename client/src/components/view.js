import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { avatar } from './misc_functions';
import sleeperLogo from '../images/sleeper_icon.png';
const Leagues = React.lazy(() => import('./Leagues/leagues'));
const Players = React.lazy(() => import('./Players/players'));
const Leaguemates = React.lazy(() => import('./Leaguemates/leaguemates'));

const View = ({ isLoading, stateAllPlayers, stateWeeklyRankings, state_user, stateLeagues, stateLeaguemates, statePlayerShares }) => {
    const [stateLeaguesFiltered, setStateLeaguesFiltered] = useState([]);
    const [stateLeaguematesFiltered, setStateLeaguematesFiltered] = useState([]);
    const [statePlayerSharesFiltered, setStatePlayerSharesFiltered] = useState([]);
    const [tab, setTab] = useState('Leagues');
    const [type1, setType1] = useState('All');
    const [type2, setType2] = useState('All');

    useEffect(() => {
        const fetchFiltered = () => {
            const filter1 = type1
            const filter2 = type2
            const leagues = stateLeagues
            const leaguemates = stateLeaguemates
            const playershares = statePlayerShares
            let filteredLeagues;
            let filteredLeaguemates;
            let filteredPlayerShares;
            switch (filter1) {
                case ('Redraft'):
                    filteredLeagues = leagues.filter(x => x.settings.type !== 2);
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.settings.type !== 2)
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.settings.type !== 2)
                        }
                    })
                    break;
                case ('All'):
                    filteredLeagues = leagues;
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
                case ('Dynasty'):
                    filteredLeagues = leagues.filter(x => x.settings.type === 2)
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.settings.type === 2)
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.settings.type === 2)
                        }
                    })
                    break;
                default:
                    filteredLeagues = leagues;
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
            }
            let filteredLeagues2 = filteredLeagues
            let filteredLeaguemates2 = filteredLeaguemates
            let filteredPlayerShares2 = filteredPlayerShares
            switch (filter2) {
                case ('Bestball'):
                    filteredLeagues2 = filteredLeagues.filter(x => x.settings.best_ball === 1);
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.settings.best_ball === 1)
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.settings.best_ball === 1)
                        }
                    })
                    break;
                case ('All'):
                    filteredLeagues2 = filteredLeagues;
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
                case ('Standard'):
                    filteredLeagues2 = filteredLeagues.filter(x => x.settings.best_ball !== 1);
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.best_ball !== 1)
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.settings.best_ball !== 1)
                        }
                    })
                    break;
                default:
                    filteredLeagues2 = filteredLeagues;
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
            }

            setStateLeaguesFiltered([...filteredLeagues2])
            setStateLeaguematesFiltered([...filteredLeaguemates2])
            setStatePlayerSharesFiltered([...filteredPlayerShares2])
        }

        fetchFiltered()

    }, [type1, type2, stateLeagues])

    const totals = (
        isLoading ? null :
            <table className="summary">
                <tbody>
                    <tr>
                        <td colSpan={6} className="bold">{stateLeaguesFiltered.length} Leagues</td>
                    </tr>
                    <tr>
                        <th>W</th>
                        <th>L</th>
                        <th>T</th>
                        <th>WPCT</th>
                        <th>Pts For</th>
                        <th>Pts Against</th>
                    </tr>
                    <tr>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.wins || 0, 0)
                            }
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.losses || 0, 0)
                            }
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.ties || 0, 0)
                            }
                        </td>
                        <td>
                            <em>
                                {
                                    (
                                        stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.wins || 0, 0) /
                                        stateLeaguesFiltered.reduce((acc, cur) => acc + (cur.userRoster.settings?.wins || 0) +
                                            (cur.userRoster.settings?.losses || 0) + (cur.userRoster.settings?.ties || 0), 0)
                                    ).toLocaleString("en-US", {
                                        maximumFractionDigits: 4,
                                        minimumFractionDigits: 4
                                    })
                                }
                            </em>
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.fpts || 0, 0).toLocaleString("en-US", {
                                    maximumFractionDigits: 2
                                })
                            } pts
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.fpts_against || 0, 0).toLocaleString("en-US", {
                                    maximumFractionDigits: 2
                                })
                            } pts
                        </td>
                    </tr>
                </tbody>
            </table>
    )

    let loadingMessage = (
        <div>
            <h2>
                Loading Leagues...
            </h2>
            <div className='logo_wrapper'>
                <img src={sleeperLogo} alt={'logo'} />
                <div className='z one'>Z</div>
                <div className='z two'>Z</div>
                <div className='z three'>Z</div>
            </div>
        </div>
    )

    let display;
    switch (tab) {
        case 'Leagues':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={loadingMessage}>
                    <Leagues
                        prop_leagues={stateLeaguesFiltered}
                        weekly_rankings={stateWeeklyRankings}
                        allplayers={stateAllPlayers}
                        user_id={state_user.user_id}
                        avatar={avatar}
                    />
                </React.Suspense>
            break;
        case 'Players':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={loadingMessage}>
                    <Players
                        player_shares={statePlayerSharesFiltered}
                        weekly_rankings={stateWeeklyRankings}
                        allplayers={stateAllPlayers}
                        user_id={state_user.user_id}
                        avatar={avatar}
                    />
                </React.Suspense>
            break;
        case 'Leaguemates':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={
                    <div className='logo_wrapper'>
                        <div className='z one'>Z</div>
                        <div className='z two'>Z</div>
                        <div className='z three'>Z</div>
                    </div>
                }>
                    <Leaguemates
                        leaguemates={stateLeaguematesFiltered}
                        user_id={state_user.user_id}
                        username={state_user.display_name}
                        avatar={avatar}
                    />
                </React.Suspense>
            break;
        default:
            break;
    }


    return <>
        <div id={'view'}>
            <Link to="/" className="home">
                Home
            </Link>
            {
                state_user === 'Invalid' ? <h1 className="error">USERNAME NOT FOUND</h1> :
                    !state_user ? <h1>Loading...</h1> :
                        <>
                            <div className="heading">
                                <h1>
                                    <p className="image">
                                        {
                                            avatar(state_user.avatar, state_user.display_name, 'user')
                                        }
                                        <strong>
                                            {state_user.display_name}
                                        </strong>
                                    </p>
                                </h1>
                                <div className="navbar">
                                    <button
                                        className={tab === 'Leagues' ? 'active clickable' : 'clickable'}
                                        onClick={() => setTab('Leagues')}>
                                        Leagues
                                    </button>
                                    <button
                                        className={tab === 'Players' ? 'active clickable' : 'clickable'}
                                        onClick={() => setTab('Players')}>
                                        Players
                                    </button>
                                    <button
                                        className={tab === 'Leaguemates' ? 'active clickable' : 'clickable'}
                                        onClick={() => setTab('Leaguemates')}>
                                        Leaguemates
                                    </button>
                                </div>
                                <div className="switch_wrapper">
                                    <div className="switch">
                                        <button className={type1 === 'Redraft' ? 'active clickable' : 'clickable'} onClick={() => setType1('Redraft')}>Redraft</button>
                                        <button className={type1 === 'All' ? 'active clickable' : 'clickable'} onClick={() => setType1('All')}>All</button>
                                        <button className={type1 === 'Dynasty' ? 'active clickable' : 'clickable'} onClick={() => setType1('Dynasty')}>Dynasty</button>
                                    </div>
                                    <div className="switch">
                                        <button className={type2 === 'Bestball' ? 'active clickable' : 'clickable'} onClick={() => setType2('Bestball')}>Bestball</button>
                                        <button className={type2 === 'All' ? 'active clickable' : 'clickable'} onClick={() => setType2('All')}>All</button>
                                        <button className={type2 === 'Standard' ? 'active clickable' : 'clickable'} onClick={() => setType2('Standard')}>Standard</button>
                                    </div>
                                </div>
                                <div className="summary">
                                    {totals}
                                </div>
                            </div>
                            <div className={'tab'}>
                                {display}
                            </div>
                        </>
            }
        </div>
    </>
}

export default View;