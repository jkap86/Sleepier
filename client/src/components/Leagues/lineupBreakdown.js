import { useEffect } from "react";

const LineupBreakdown = ({ type, roster, lineup_check, avatar, allplayers, activeSlot, setActiveSlot, includeTaxi }) => {

    useEffect(() => {

    }, [includeTaxi])

    console.log(activeSlot)
    const display = lineup_check.map((slot, index) =>
        <tbody key={`${slot.cur_id}_${index}`}>
            <tr
                className={
                    activeSlot?.slot === slot.slot && activeSlot?.index === index ?
                        `row${type} active clickable` : `row${type} clickable`
                }
                onClick={() => setActiveSlot(slot)}
            >
                <td colSpan={1}
                    className={(slot.subs.length + slot.subs_taxi?.length) > 0 ? 'sub' : null}
                >
                    {slot.slot_abbrev}
                </td>
                <td colSpan={3} className={'left'}>
                    <p>
                        {
                            avatar(slot.cur_id, allplayers[slot.cur_id]?.full_name, 'player')
                        }
                        {allplayers[slot.cur_id]?.full_name}
                    </p>
                </td>
                <td>
                    {slot.cur_rank === 1000 ? 'BYE' : slot.cur_rank}
                </td>
                <td>
                    {
                        allplayers[slot.cur_id]?.rank_ecr >= 999 ? '-' :
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
        </tbody>
    )

    const subs = activeSlot ? activeSlot.subs :
        roster.players.filter(p => !roster.starters?.includes(p) && !roster.taxi?.includes(p))
    const taxi = activeSlot ? activeSlot.subs_taxi : roster.taxi

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
            <thead>
                <tr className={'single'}>
                    <th colSpan={9}>
                        {activeSlot ? 'Better Options' : 'Bench'}
                    </th>
                </tr>
            </thead>
            <tbody>
                {
                    subs
                        .sort((a, b) => (allplayers[a]?.rank_ecr || 999) -
                            (allplayers[b]?.rank_ecr || 999))
                        .map((bp, index) =>
                            <tr
                                key={`${bp}_${index}`}
                            >
                                <td colSpan={1}>
                                    {allplayers[bp]?.position}
                                </td>
                                <td colSpan={5} className={'left'}>
                                    <p>
                                        {
                                            avatar(bp, allplayers[bp]?.full_name, 'player')
                                        }
                                        {allplayers[bp]?.full_name}
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
            {
                taxi?.length > 0 ?
                    <thead>
                        <tr className={'single'}>
                            <th colSpan={9}>Taxi</th>
                        </tr>
                    </thead>
                    : null
            }
            {
                taxi?.length > 0 ?
                    <tbody>
                        {taxi
                            ?.map((bp, index) =>
                                <tr
                                    key={`${bp}_${index}`}
                                >
                                    <td colSpan={1}>
                                        {allplayers[bp]?.position}
                                    </td>
                                    <td colSpan={5} className={'left'}>
                                        <p>
                                            {
                                                avatar(bp, allplayers[bp]?.full_name, 'player')
                                            }
                                            {allplayers[bp]?.full_name}
                                        </p>
                                    </td>
                                    <td colSpan={1}>
                                        {allplayers[bp]?.rank_ecr || '-'}
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
                    : null
            }
        </table>
    </>
}

export default LineupBreakdown;