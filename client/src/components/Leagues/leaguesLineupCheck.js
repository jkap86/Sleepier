import React, { useState, useEffect } from 'react';
import { avatar } from "../misc_functions";
const LineupBreakdown = React.lazy(() => import('./lineupBreakdown'));

const LeaguesLineupCheck = ({ sortLeagues, leagues_display, page, setPage, rowRef, rostersVisible, setRostersVisible, allplayers, syncLeague, user_id, includeTaxi }) => {
    const [syncing, setSyncing] = useState(false)
    const [activeSlot, setActiveSlot] = useState(null)

    useEffect(() => {
        if (rostersVisible !== '' && activeSlot) {
            const active_league = leagues_display.find(x => x.league_id === rostersVisible)
            const active_slot = active_league?.lineup_check.find(slot => slot.cur_id === activeSlot.cur_id)
            setActiveSlot({ ...active_slot })
        }
    }, [leagues_display])

    useEffect(() => {
        if (!rostersVisible) {
            setActiveSlot(null)
        }
    }, [rostersVisible])

    const handleSyncLeague = (league_id, user_id) => {
        setSyncing(true)
        syncLeague(league_id, user_id)
        setTimeout(() => {
            setSyncing(false)
        }, 5000)
    }

    const header = (
        <>
            <tr className="main_header single">
                <th colSpan={3}
                    className={'clickable'}
                    onClick={() => sortLeagues('League')}
                >
                    League
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                    onClick={() => sortLeagues('Empty Slots')}
                >
                    Empty/Bye Slots
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                    onClick={() => sortLeagues('SO Slots')}
                >
                    Suboptimal Slots
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                    onClick={() => sortLeagues('SO Slots')}
                >
                    QBs in SF
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                    onClick={() => sortLeagues('SO Slots')}
                >
                    Optimal Lineup
                </th>
            </tr>
        </>
    )


    const display = (
        <>
            {
                leagues_display
                    .slice(Math.max((page - 1) * 25, 0), ((page - 1) * 25) + 25)
                    .map((league, index) =>
                        <tbody
                            key={`${league.league_id}_${index}`}
                            className={rostersVisible === league.league_id ? 'active' : null}
                        >
                            <tr>
                                <td colSpan={7} >
                                    <table className={`table${1}`}>
                                        <tbody>
                                            <tr
                                                ref={index === 0 ? rowRef : null}
                                                className={rostersVisible === league.league_id ? 'main_row active clickable' : 'main_row clickable'}
                                                onClick={() => setRostersVisible(prevState => prevState === league.league_id ? '' : league.league_id)}
                                            >
                                                <td colSpan={3} className={'left'}>
                                                    <p>
                                                        {
                                                            avatar(league.avatar, league.name, 'league')
                                                        }
                                                        {league.name}
                                                    </p>
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.empty_slots > 0 ?
                                                            <p className='red'>{league.empty_slots}</p>
                                                            :
                                                            <i className={'fa fa-check green'}></i>
                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.so_slots > 0 ?
                                                            <p className='red'>{league.so_slots}</p>
                                                            :
                                                            <i className={'fa fa-check green'}></i>
                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.qb_in_sf ?
                                                            <i className={'fa fa-check green'}></i>
                                                            :
                                                            <i className={'fa fa-times red'}></i>
                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.optimal_lineup ?
                                                            <i className={'fa fa-check green'}></i>
                                                            :
                                                            <i className={'fa fa-times red'}></i>
                                                    }
                                                </td>
                                            </tr>
                                            {
                                                rostersVisible !== league.league_id ? null :
                                                    <tr>
                                                        <td colSpan={7}>
                                                            <div className={`nav2`}>
                                                                {
                                                                    syncing ? null :
                                                                        <button
                                                                            className={'clickable'}
                                                                            onClick={() => handleSyncLeague(league.league_id, user_id)}
                                                                        >
                                                                            Sync League
                                                                        </button>
                                                                }
                                                            </div>
                                                            <React.Suspense fallback={
                                                                <div className='logo_wrapper'>
                                                                    <div className='z one'>Z</div>
                                                                    <div className='z two'>Z</div>
                                                                    <div className='z three'>Z</div>
                                                                </div>}>
                                                                <LineupBreakdown
                                                                    type={2}
                                                                    roster={league.userRoster}
                                                                    lineup_check={league.lineup_check}
                                                                    avatar={avatar}
                                                                    allplayers={allplayers}
                                                                    activeSlot={activeSlot}
                                                                    setActiveSlot={(slot) => setActiveSlot(slot)}
                                                                    includeTaxi={includeTaxi}
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
                (((page - 1) * 25) + 25) < leagues_display.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={7}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </>
    )

    return <>
        <table className="main">
            <thead className="main">
                {header}
            </thead>
            {display}
        </table>
    </>
}
export default LeaguesLineupCheck;