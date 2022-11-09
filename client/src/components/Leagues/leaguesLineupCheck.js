import React, { useState, useEffect, useRef } from 'react';
import { avatar } from "../misc_functions";
import { getLineupCheck } from '../projections_stats';
import taxi from '../../images/taxi.png';
const Search = React.lazy(() => import('../search'));
const LineupBreakdown = React.lazy(() => import('./lineupBreakdown'));

const LeaguesLineupCheck = ({ prop_leagues, allplayers, syncLeague, user_id, includeTaxi, setIncludeTaxi, rankMargin, setRankMargin, stateStats }) => {
    const [syncing, setSyncing] = useState(false)
    const [tab, setTab] = useState('Lineup Check');
    const [searched, setSearched] = useState('')
    const [activeSlot, setActiveSlot] = useState(null)
    const [page, setPage] = useState(1)
    const [rostersVisible, setRostersVisible] = useState('')
    const rowRef = useRef(null)
    const [leagues, setLeagues] = useState([])

    useEffect(() => {
        const l = prop_leagues.map(l => {
            const league_check = getLineupCheck(l.roster_positions, l.userRoster, allplayers, parseInt(includeTaxi), parseInt(rankMargin), stateStats)
            const empty_slots = l.userRoster.starters?.filter(s => s === '0').length
            const bye_slots = league_check.filter(slot => slot.cur_rank === 1000).map(slot => slot.cur_id).length
            const so_slots = league_check.filter(slot => !slot.isInOptimal).length
            return {
                ...l,
                empty_slots: empty_slots + bye_slots,
                so_slots: so_slots,
                qb_in_sf: league_check
                    .filter(slot => slot.slot === 'SUPER_FLEX' && allplayers[slot.cur_id]?.position !== 'QB').length < 1,
                optimal_lineup: so_slots === 0,
                lineup_check: league_check
            }
        })
        setLeagues([...l])

    }, [prop_leagues, includeTaxi, rankMargin, stateStats])

    useEffect(() => {
        if (rostersVisible !== '' && activeSlot) {
            const active_league = leagues.find(x => x.league_id === rostersVisible)
            const active_slot = active_league?.lineup_check.find(slot => slot.cur_id === activeSlot.cur_id)
            setActiveSlot({ ...active_slot })
        }
    }, [leagues])

    useEffect(() => {
        setActiveSlot(null)

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
                >
                    League
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                >
                    Empty/Bye Slots
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                >
                    Suboptimal Slots
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                >
                    QBs in SF
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                >
                    Optimal Lineup
                </th>
            </tr>
        </>
    )

    const leagues_display = searched.trim().length === 0 ? leagues :
        leagues.filter(x => x.name.trim() === searched.trim())

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
        <React.Suspense fallback={<>...</>}>
            <Search
                list={leagues.map(league => league.name)}
                placeholder={'Search Leagues'}
                sendSearched={(data) => setSearched(data)}
            />
        </React.Suspense>
        <div className="page_numbers_wrapper">
            <ol className="page_numbers">
                {Array.from(Array(Math.ceil(leagues_display.length / 25)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => setPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
        </div>
        <div className='nav1'>
            <div className={'nav1_button_wrapper'}>
                <button
                    className={tab === 'Lineup Check' ? 'active clickable' : 'clickable'}
                    onClick={() => setTab('Lineup Check')}
                >
                    Lineup Check
                </button>
            </div>
            <div className={'lineupcheck_options'}>
                <div className={'lineupcheck_option'}>
                    <img
                        className={'taxi'}
                        src={taxi}
                    />
                    <i
                        onClick={() => setIncludeTaxi(prevState => prevState === 1 ? -1 : 1)}
                        className={`fa fa-ban clickable ${includeTaxi > 0 ? 'hidden' : null}`}>

                    </i>
                </div>
                <label>
                    Rank Margin
                    <select
                        value={rankMargin}
                        onChange={(e) => setRankMargin(e.target.value)}
                    >
                        {Array.from(Array(51).keys()).map(key =>
                            <option key={key}>{key}</option>
                        )}
                    </select>
                </label>
            </div>
        </div>
        <table className="main">
            <thead className="main">
                {header}
            </thead>
            {display}
        </table>
    </>
}
export default LeaguesLineupCheck;