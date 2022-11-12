
const LineupBreakdown = ({ type, roster, lineup_check, avatar, allplayers, activeSlot, setActiveSlot, includeTaxi }) => {

    const display = lineup_check.map((slot, index) =>
        <tbody key={`${slot.cur_id}_${index}`}>
            <tr
                className={
                    activeSlot?.slot === slot.slot && activeSlot?.index === index ?
                        `row${type} active clickable` : `row${type} clickable`
                }
                onClick={() => setActiveSlot(prevState => prevState?.cur_id === slot.cur_id ? null : slot)}
            >
                <td colSpan={1}
                    className={
                        !slot.isInOptimal ? 'red'
                            : slot.isInOptimalOrdered === 'E' ? 'after_main_slate'
                                : slot.isInOptimalOrdered === 'L' ? 'before_main_slate'
                                    : (slot.slot_abbrev === 'SF' && allplayers[slot.cur_id]?.position !== 'QB') ? 'non_qb_sf'
                                        : null
                    }
                >
                    {slot.slot_abbrev}
                </td>
                <td colSpan={3} className={'left'}>
                    <p>
                        {
                            avatar(slot.cur_id, allplayers[slot.cur_id]?.full_name, 'player')
                        }
                        {
                            parseInt(slot.cur_id) === 0 ? 'Empty' :
                                `${allplayers[slot.cur_id]?.position} ${allplayers[slot.cur_id]?.full_name} ${allplayers[slot.cur_id]?.team || 'FA'}`
                        }
                        {
                            allplayers[slot.cur_id]?.injury ?
                                <p className={'red small'}>
                                    {allplayers[slot.cur_id]?.injury}
                                </p>
                                : null
                        }
                    </p>
                </td>
                <td className={slot.tv_slot}>
                    {slot.cur_rank === 1000 ? 'BYE' : slot.cur_rank || '-'}
                </td>
                <td>
                    {
                        !(allplayers[slot.cur_id]?.rank_ecr <= 999) ? '-' :
                            allplayers[slot.cur_id]?.position === 'FB' ? 'RB' : allplayers[slot.cur_id]?.position + "" +
                                (Object.keys(allplayers)
                                    .filter(ap =>
                                        allplayers[ap].position === allplayers[slot.cur_id]?.position ||
                                        (allplayers[slot.cur_id]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                    )
                                    .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                    .indexOf(slot.cur_id) + 1)
                    }
                </td>
            </tr>
        </tbody >
    )
    const optimal_options = (
        !activeSlot ? roster.players.filter(p => !roster.starters?.includes(p) && (includeTaxi > 0 || !roster.taxi?.includes(p))) :
            activeSlot ? activeSlot.optimal_options : null
    )

    const swaps = activeSlot?.swaps

    return <>
        <table className={`table${type} lineup`}>
            <thead>
                <tr className={'single'}>
                    <th colSpan={1}>Slot</th>
                    <th colSpan={3}>Starter</th>
                    <th colSpan={1}>Rank</th>
                    <th colSpan={1}>Pos Rank</th>
                </tr>
            </thead>
            {display}
        </table>

        <table className={`table${type} subs`}>
            {
                <thead>
                    <tr className={'double'}>
                        <th colSpan={1}>Slot</th>
                        <th colSpan={6}>Starter</th>
                        <th colSpan={1}>Rank</th>
                        <th colSpan={2}>Pos Rank</th>
                    </tr>
                    <tr className={'double'}>
                        <th colSpan={10}>{!activeSlot ? 'Bench' : swaps ? 'Swap with' : 'Sub in'}</th>
                    </tr>
                </thead>
            }
            {
                swaps?.length > 0 ?
                    swaps
                        ?.sort((a, b) => (roster.taxi?.includes(a.swap) - roster.taxi?.includes(b.swap)) ||
                            (allplayers[a.swap]?.rank_ecr || 999) - (allplayers[b.swap]?.rank_ecr || 999))
                        ?.map((swap, index) =>
                            <tbody key={`${swap}_${index}`}
                            >
                                <tr>
                                    <td colSpan={1}>
                                        {
                                            roster.taxi?.includes(swap.cur_id) ? 'Taxi' :
                                                roster.reserve?.includes(swap.cur_id) ? 'IR' :
                                                    lineup_check.find(x => x.cur_id === swap.cur_id)?.slot_abbrev || 'BN'
                                        }
                                    </td>
                                    <td colSpan={6} className={'left'}>
                                        <p>
                                            {
                                                avatar(swap.cur_id, allplayers[swap.cur_id]?.full_name, 'player')
                                            }
                                            {`${allplayers[swap.cur_id]?.position} ${allplayers[swap.cur_id]?.full_name} ${allplayers[swap.cur_id]?.team || 'FA'}`}
                                            {
                                                allplayers[swap.cur_id]?.injury ?
                                                    <p className={'red small'}>
                                                        {allplayers[swap.cur_id]?.injury}
                                                    </p>
                                                    : null
                                            }
                                        </p>
                                    </td>
                                    <td colSpan={1}>
                                        {allplayers[swap.cur_id]?.rank_ecr === 1000 ? 'BYE' : allplayers[swap.cur_id]?.rank_ecr || 999}
                                    </td>
                                    <td colSpan={2}>
                                        {
                                            allplayers[swap.cur_id]?.rank_ecr >= 999 ? '-' :
                                                allplayers[swap.cur_id]?.position === 'FB' ? 'RB' : allplayers[swap.cur_id]?.position + "" +
                                                    (Object.keys(allplayers)
                                                        .filter(ap =>
                                                            allplayers[ap].position === allplayers[swap.cur_id]?.position ||
                                                            (allplayers[swap.cur_id]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                                        )
                                                        .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                                        .indexOf(swap.cur_id) + 1)
                                        }
                                    </td>
                                </tr>
                                <tr className={'title'}>
                                    <td colSpan={10} className={'transparent'}>Sub in</td>
                                </tr>
                                {
                                    swap.optimal_options.map(opt =>
                                        <tr key={opt} className={'swap'}>
                                            <td colSpan={1}>
                                                {
                                                    roster.taxi?.includes(opt) ? 'Taxi' :
                                                        roster.reserve?.includes(opt) ? 'IR' :
                                                            lineup_check.find(x => x.cur_id === opt)?.slot_abbrev || 'BN'
                                                }
                                            </td>
                                            <td colSpan={6} className={'left'}>
                                                <p>
                                                    {
                                                        avatar(opt, allplayers[opt]?.full_name, 'player')
                                                    }
                                                    {`${allplayers[opt]?.position} ${allplayers[opt]?.full_name} ${allplayers[opt]?.team || 'FA'}`}
                                                    {
                                                        allplayers[opt]?.injury ?
                                                            <p className={'red small'}>
                                                                {allplayers[opt]?.injury}
                                                            </p>
                                                            : null
                                                    }
                                                </p>
                                            </td>
                                            <td colSpan={1}>
                                                {allplayers[opt]?.rank_ecr === 1000 ? 'BYE' : allplayers[opt]?.rank_ecr || 999}
                                            </td>
                                            <td colSpan={2}>
                                                {
                                                    allplayers[opt]?.rank_ecr >= 999 ? '-' :
                                                        allplayers[opt]?.position === 'FB' ? 'RB' : allplayers[opt]?.position + "" +
                                                            (Object.keys(allplayers)
                                                                .filter(ap =>
                                                                    allplayers[ap].position === allplayers[opt]?.position ||
                                                                    (allplayers[opt]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                                                )
                                                                .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                                                .indexOf(opt) + 1)
                                                }
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        )
                    : null
            }
            {
                optimal_options?.length > 0 ?
                    optimal_options
                        ?.sort((a, b) => (roster.taxi?.includes(a) - roster.taxi?.includes(b)) || (allplayers[a]?.rank_ecr || 999) -
                            (allplayers[b]?.rank_ecr || 999))
                        ?.map((bp, index) =>
                            <tbody key={`${bp}_${index}`}
                            >
                                <tr className={activeSlot ? 'swap' : null}>
                                    <td colSpan={1}>
                                        {
                                            roster.taxi?.includes(bp) ? 'Taxi' :
                                                roster.reserve?.includes(bp) ? 'IR' :
                                                    lineup_check.find(x => x.cur_id === bp)?.slot_abbrev || 'BN'
                                        }
                                    </td>
                                    <td colSpan={6} className={'left'} onClick={() => console.log(allplayers[bp])}>
                                        <p>
                                            {
                                                avatar(bp, allplayers[bp]?.full_name, 'player')
                                            }
                                            {`${allplayers[bp]?.position} ${allplayers[bp]?.full_name} ${allplayers[bp]?.team || 'FA'}`}
                                            {
                                                allplayers[bp]?.injury ?
                                                    <p className={'red small'}>
                                                        {allplayers[bp]?.injury}
                                                    </p>
                                                    : null
                                            }
                                        </p>
                                    </td>
                                    <td colSpan={1}>
                                        {allplayers[bp]?.rank_ecr === 1000 ? 'BYE' : allplayers[bp]?.rank_ecr || 999}
                                    </td>
                                    <td colSpan={2}>
                                        {
                                            allplayers[bp]?.rank_ecr >= 999 ? '-' :
                                                allplayers[bp]?.position === 'FB' ? 'RB' : allplayers[bp]?.position + "" +
                                                    (Object.keys(allplayers)
                                                        .filter(ap =>
                                                            allplayers[ap].position === allplayers[bp]?.position ||
                                                            (allplayers[bp]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                                        )
                                                        .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                                        .indexOf(bp) + 1)
                                        }
                                    </td>
                                </tr>
                                {
                                    activeSlot?.swap_options ?
                                        <>
                                            <tr>
                                                <td colSpan={4} className={'transparent'}></td>
                                                <td colSpan={2}>Swap With</td>
                                                <td colSpan={4} className={'transparent'}></td>
                                            </tr>
                                            {activeSlot?.swap_options?.map((option, index) =>
                                                <tr key={`${option}_${index}`}
                                                    className={'lineup_option'}
                                                >
                                                    <td colSpan={2}>
                                                        {
                                                            roster.taxi?.includes(option) ? 'Taxi' :
                                                                roster.reserve?.includes(option) ? 'IR' :
                                                                    lineup_check.find(x => x.cur_id === option)?.slot_abbrev || 'BN'
                                                        }
                                                    </td>
                                                    <td colSpan={5} className={'left'}>
                                                        <p>
                                                            {
                                                                avatar(option, allplayers[option]?.full_name, 'player')
                                                            }
                                                            {`${allplayers[option]?.position} ${allplayers[option]?.full_name} ${allplayers[option]?.team || 'FA'}`}
                                                            {
                                                                allplayers[option]?.injury ?
                                                                    <p className={'red small'}>
                                                                        {allplayers[option]?.injury}
                                                                    </p>
                                                                    : null
                                                            }
                                                        </p>
                                                    </td>
                                                    <td colSpan={1}>

                                                    </td>
                                                    <td colSpan={2}>

                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                        : null
                                }
                            </tbody>
                        )
                    : null
            }
        </table>
    </>
}

export default LineupBreakdown;