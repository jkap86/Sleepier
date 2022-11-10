
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
                        !slot.isInOptimal || slot.cur_id === 0 || slot.cur_rank === 1000 ||
                            ['E', 'L'].includes(slot.isInOptimalOrdered) || (slot.cur_abbrev === 'SF' && allplayers[slot.cur_id]?.position !== 'QB')
                            ? 'sub'
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
        !activeSlot ? roster.players.filter(p => !roster.starters?.includes(p) && !roster.taxi?.includes(p)) :
            activeSlot?.swaps ? activeSlot.swaps :
                activeSlot ? activeSlot.optimal_options : null
    )

    const subs = activeSlot?.better_options

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
                optimal_options?.length > 0 ?
                    <thead>
                        <tr className={'double'}>
                            <th colSpan={1}>Slot</th>
                            <th colSpan={6}>Starter</th>
                            <th colSpan={1}>Rank</th>
                            <th colSpan={2}>Pos Rank</th>
                        </tr>
                        <tr className={'double'}>
                            <th colSpan={10}>{!activeSlot ? 'Bench' : activeSlot?.swaps ? 'Swap With' : 'Optimal'}</th>
                        </tr>
                    </thead>
                    : null
            }
            {
                optimal_options?.length > 0 ?
                    optimal_options
                        ?.sort((a, b) => (roster.taxi?.includes(a) - roster.taxi?.includes(b)) || (allplayers[a]?.rank_ecr || 999) -
                            (allplayers[b]?.rank_ecr || 999))
                        ?.map((bp, index) =>
                            <tbody key={`${bp}_${index}`}
                                className={activeSlot?.swaps ? 'lineup_option' : null}
                            >
                                <tr>
                                    <td colSpan={1}>
                                        {
                                            roster.taxi?.includes(bp) ? 'Taxi' :
                                                roster.reserve?.includes(bp) ? 'IR' :
                                                    lineup_check.find(x => x.cur_id === bp)?.slot_abbrev || 'BN'
                                        }
                                    </td>
                                    <td colSpan={6} className={'left'}>
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
            {
                subs?.length > 0 ?
                    <thead>
                        <tr className={'single'}>
                            <th colSpan={9}>
                                {'Better Options'}
                            </th>
                        </tr>
                    </thead>
                    : null
            }
            <tbody>
                {
                    subs
                        ?.sort((a, b) => (allplayers[a]?.rank_ecr || 999) -
                            (allplayers[b]?.rank_ecr || 999))
                        ?.map((bp, index) =>
                            <tr
                                key={`${bp}_${index}`}
                            >
                                <td colSpan={1}>
                                    {
                                        roster.taxi?.includes(bp) ? 'Taxi' :
                                            roster.reserve?.includes(bp) ? 'IR' :
                                                'BN'
                                    }
                                </td>
                                <td colSpan={5} className={'left'}>
                                    <p>
                                        {
                                            avatar(bp, allplayers[bp]?.full_name, 'player')
                                        }
                                        {allplayers[bp]?.full_name}
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
                        )
                }
            </tbody>
        </table>
    </>
}

export default LineupBreakdown;