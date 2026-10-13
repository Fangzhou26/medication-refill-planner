import { useState } from 'react'
import { REFERENCE_DATE, dateAt, shortDate, eventsOn, finishDate, pickupEvents, remainingAt, type Medication } from './planner-data'

type Props = { medications: Medication[]; onOpenMedication: (med: Medication) => void }
export default function Planner({ medications, onOpenMedication }: Props) {
  const [month, setMonth] = useState('2026-10')
  const [selectedDate, setSelectedDate] = useState('2026-10-19')
  const [showAll, setShowAll] = useState(false)
  const [cursor, setCursor] = useState(0)
  const first = `${month}-01`
  const monthDate = new Date(`${first}T00:00:00Z`)
  const leading = (monthDate.getUTCDay() + 6) % 7
  const count = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate()
  const selectedEvents = eventsOn(selectedDate, medications)
  const dates = Array.from({ length: 14 }, (_, i) => dateAt(REFERENCE_DATE, i))
  const known = medications.filter(med => med.risk !== 'unknown').sort((a, b) => a.days - b.days)
  const visible = showAll ? known : known.filter(med => med.risk === 'critical' || med.risk === 'soon').slice(0, 3)
  const currentDate = dates[cursor]
  const moveMonth = (offset: number) => {
    const next = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + offset, 1)).toISOString().slice(0, 10)
    setMonth(next.slice(0, 7)); setSelectedDate(next)
  }
  return <>
    <section className="planner-calendar" aria-labelledby="calendar-title">
      <div className="calendar-heading"><h2 id="calendar-title">{monthDate.getUTCFullYear()}年{monthDate.getUTCMonth() + 1}月</h2><div><button aria-label="上个月" onClick={() => moveMonth(-1)}>‹</button><button aria-label="下个月" onClick={() => moveMonth(1)}>›</button></div></div>
      <div className="month-weekdays" aria-hidden="true">{['一', '二', '三', '四', '五', '六', '日'].map(day => <span key={day}>{day}</span>)}</div>
      <div className="month-grid">{Array.from({ length: leading }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: count }, (_, i) => {
        const date = dateAt(first, i)
        const events = eventsOn(date, medications)
        return <button key={date} className={`month-day ${date === selectedDate ? 'selected-day' : ''} ${date === REFERENCE_DATE ? 'reference-day' : ''}`} aria-pressed={date === selectedDate} aria-label={`${shortDate(date)}${date === REFERENCE_DATE ? '，示例今天' : ''}，${events.length ? events.map(event => event.text).join('；') : '无记录事项'}`} onClick={() => setSelectedDate(date)}><span>{i + 1}</span><span className="day-markers" aria-hidden="true">{['pickup', 'finish', 'hospital'].filter(kind => events.some(event => event.kind === kind)).map(kind => <i key={kind} className={`event-mark ${kind}`}>{kind === 'hospital' ? '?' : ''}</i>)}</span></button>
      })}</div>
      <div className="planner-legend"><span><i className="event-mark pickup" />取药</span><span><i className="event-mark finish" />预计吃完</span><span><i className="event-mark hospital">?</i>开放待确认</span></div>
      <div className="selected-day-detail" aria-live="polite"><strong>{shortDate(selectedDate)}</strong>{selectedEvents.length ? selectedEvents.map(event => <p key={event.kind} className={`event-description ${event.kind}`}><i className={`event-mark ${event.kind}`} aria-hidden="true">{event.kind === 'hospital' ? '?' : ''}</i>{event.text}</p>) : <p>这一天没有记录事项。</p>}{selectedEvents.some(event => event.kind === 'pickup') && <small>示例取药安排；药房开放与领取条件需核实。</small>}</div>
    </section>
    <section className="inventory-planner" aria-labelledby="runway-title"><div className="section-heading"><h2 id="runway-title">库存覆盖示例</h2><span>未来 14 天</span></div><p className="planner-description">10月13日 — 26日 · 仅供界面演示</p>
      <div className="runway-legend"><span><i className="coverage-swatch" />库存可覆盖</span><span><i className="event-mark pickup" />取药</span><span><i className="event-mark finish" />吃完</span></div>
      <div className="runway-axis" aria-hidden="true">{dates.map((date, index) => <span key={date}>{[0, 3, 6, 9, 13].includes(index) ? `${Number(date.slice(5, 7))}/${Number(date.slice(8))}` : ''}</span>)}</div>
      {visible.length ? visible.map(med => {
        const end = finishDate(med)
        const pickup = pickupEvents.find(event => event.medicationIds.includes(med.id))
        return <article className={`runway-row ${med.risk}`} key={med.id}><button className="runway-med-heading" onClick={() => onOpenMedication(med)}><strong>{med.name}</strong><span>{end ? `${shortDate(end)}吃完` : '日期待补充'} ›</span></button><div className="runway-track" role="img" aria-label={`${med.name}，现有库存可覆盖${med.days}天，${end ? `${shortDate(end)}预计吃完` : '日期待补充'}${pickup ? `，${shortDate(pickup.date)}计划取药` : ''}`}>
          {dates.map((date, i) => <div key={date} className={`runway-cell ${i < med.days ? 'covered' : ''} ${i === cursor ? 'cursor-cell' : ''}`}><span className="runway-fill" />{pickup?.date === date && <i className="event-mark pickup" />}{end === date && <i className="event-mark finish" />}</div>)}
        </div><p className="runway-remaining">{shortDate(currentDate)}服药前：<strong>{remainingAt(med, cursor)} {med.unit}</strong>{cursor >= med.days && <span className="depleted"> · 不足当日用量</span>}</p></article>
      }) : <p className="planner-description">暂无需优先关注的药品。</p>}
      <div className="inventory-scrubber"><label htmlFor="inventory-day">滑动查看每天的示例库存</label><input id="inventory-day" type="range" min="0" max="13" value={cursor} aria-valuetext={`${shortDate(currentDate)}使用前`} onChange={event => setCursor(Number(event.target.value))} /><div><span>10月13日</span><output htmlFor="inventory-day">{shortDate(currentDate)}</output><span>10月26日</span></div></div>
      <button className="show-medications" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? '收起，只看需关注药品' : `查看全部 ${known.length} 种药品`}<span aria-hidden="true">{showAll ? '⌃' : '⌄'}</span></button>
      <p className="projection-note">按示例用量记录估算，包含今天。计划取药尚未计入库存；“吃完”指最后能完整服用的一天。</p>
    </section>
  </>
}
