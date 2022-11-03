import { useState } from "react";

const LineupBreakdown = ({ type, roster, lineup_check, avatar, allplayers }) => {
    const [activeSlot, setActiveSlot] = useState(null)

    const display = lineup_check.map((slot, index) =>
        <tbody key={`${slot.cur_id}_${index}`}>
            <tr
                className={
                    activeSlot?.slot === slot.slot && activeSlot?.index === index ?
                        `row${type} active clickable` : `row${type} clickable`
                }
                onClick={() => setActiveSlot(prevState => slot === prevState ? null : slot)}
            >
                <td colSpan={1}
                    className={slot.subs.length > 0 ? 'sub' : null}
                >
                    {slot.slot}
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
                    {slot.cur_rank}
                </td>
                <td>
                    {slot.cur_pos_rank}
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
                                    {allplayers[bp]?.rank_ecr || '-'}
                                </td>
                                <td colSpan={2}>
                                    {allplayers[bp]?.pos_rank || '-'}
                                </td>
                            </tr>
                        )
                }
            </tbody>
            {
                taxi?.length > 1 ?
                    <thead>
                        <tr className={'single'}>
                            <th colSpan={9}>Taxi</th>
                        </tr>
                    </thead>
                    : null
            }
            {
                taxi?.length > 1 ?
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
                                        {allplayers[bp]?.pos_rank || '-'}
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