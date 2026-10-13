import { useEffect, useRef, useState } from 'react'
import Planner from './Planner'
import { initialMedications, finishDate, shortDate, pickupEvents, coverageDays } from './planner-data'
import './App.css'

type Medication = import('./planner-data').Medication
const visits = [
  ['10月19日', '周一', '示例药物丙', '虚构示例日期；医院安排尚未确认', '示例'],
  ['10月26日', '周一', '示例药物乙', '虚构示例日期；医院安排尚未确认', '示例'],
  ['10月27日', '周二', '示例药物戊', '虚构示例日期；医院安排尚未确认', '示例'],
  ['11月12日', '周四', '示例药物丁', '虚构示例日期；医院安排尚未确认', '示例'],
  ['11月17日', '周二', '示例药物甲', '虚构示例日期；医院安排尚未确认', '示例'],
]
function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2m-8 3h2" /></>,
    pill: <><path d="M9 4a6 6 0 0 1 8.5 8.5L12.5 18A6 6 0 0 1 4 9.5Z" /><path d="m7 7 9 9" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.info}</svg>
}
type Page = 'today' | 'plan' | 'medications'
function App() {
  const [page, setPage] = useState<Page>('today')
  const [mode, setMode] = useState('noPurchase')
  const [medications, setMedications] = useState(initialMedications)
  const [newName, setNewName] = useState('')
  const [large, setLarge] = useState(false)
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [pickupQuantity, setPickupQuantity] = useState('')
  const [pickupMessage, setPickupMessage] = useState('')
  const medicationDialog = useRef<HTMLDialogElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (selectedMed) medicationDialog.current?.showModal()
  }, [selectedMed])
  const selectedFinish = selectedMed ? finishDate(selectedMed) : null
  const selectedPickup = pickupEvents.find(event => selectedMed && event.medicationIds.includes(selectedMed.id))
  const openMedication = (medication: Medication) => {
    setSelectedMed(medication)
    setPickupQuantity('')
    setPickupMessage('')
  }
  const recordPickup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMed) return
    const quantity = Number(pickupQuantity)
    if (!Number.isFinite(quantity) || quantity <= 0) return
    setMedications(current => current.map(med => med.id === selectedMed.id
      ? { ...med, stock: med.stock + quantity, days: med.perDose && med.timesDaily ? coverageDays(med.stock + quantity, med.perDose, med.timesDaily) : med.days }
      : med))
    setSelectedMed(current => current ? { ...current, stock: current.stock + quantity, days: current.perDose && current.timesDaily ? coverageDays(current.stock + quantity, current.perDose, current.timesDaily) : current.days } : current)
    setPickupMessage(`已记录取药 ${quantity} ${selectedMed.unit}，库存已更新。`)
  }
  const navigate = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }))
  }
  const addMedication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newName.trim()) return
    setMedications(current => [...current, { id: Date.now(), name: newName.trim(), strength: '规格待补充', stock: 0, days: 0, risk: 'unknown', unit: '片' }])
    setNewName('')
    dialog.current?.close()
    navigate('medications')
  }
  return <div className={`app-shell ${large ? 'large-print' : ''}`}>
    <header className="app-header"><span className="brand"><span className="brand-mark"><Icon name="plus" size={19} /></span>药程</span><button className="font-button" aria-pressed={large} onClick={() => setLarge(!large)}>{large ? '标准字' : '大字版'}<span aria-hidden="true"> Aa</span></button></header>
    <main>
      <div className="page-heading"><p className="eyebrow">{page === 'today' ? '10月13日 · 星期二 · 虚构演示日期' : page === 'plan' ? '按日期，慢慢安排' : '常用药，都在这里'}</p><h1 ref={heading} tabIndex={-1}>{page === 'today' ? '今天好。' : page === 'plan' ? '取药计划' : '我的药品'}</h1></div>
      {page === 'today' && <>
        <article className="next-pickup" aria-labelledby="next-title"><div className="card-label"><h2 id="next-title">下一次需要处理</h2><span>6 天后</span></div><div className="pickup-date">10月19日 <span>周一</span></div><div className="pickup-med"><Icon name="pill" size={24} /><div><h3>示例药物丙</h3><p>虚构示例 · 6 单位余量</p></div></div><p className="stock-warning">演示库存按虚构记录估算约 6 天 · 取药安排尚未确认</p><button className="hero-button" onClick={() => navigate('plan')}>查看取药安排<Icon name="arrow" size={20} /></button></article>
        <div className="hospital-note"><Icon name="info" size={19} /><p>这是库存截止提醒，不是已确认的医院取药预约。</p></div>
        <section className="week-section" aria-labelledby="week-title"><div className="section-heading"><h2 id="week-title">未来 7 天</h2><span>1 件事</span></div><p className="week-range">10月13日 — 19日 · 示例</p><div className="week-strip">{['二', '三', '四', '五', '六', '日', '一'].map((day, i) => <div key={`${day}-${i}`} className={i === 6 ? 'pickup-day' : i === 0 ? 'current-day' : ''}><span>{day}</span><strong>{13 + i}</strong><small>{i === 0 ? '今天' : i === 6 ? '示例' : ''}</small></div>)}</div></section>
        <details className="holiday-note"><summary><span>待确认：医院取药安排</span><span className="expand-icon" aria-hidden="true">＋</span></summary><p>当前数据只有库存截止日期和历史取药日期，医院开放日与本次领取数量尚未确认。请提前向医院核实。</p></details>
      </>}
      {page === 'plan' && <>
        <div className="mode-switch" aria-label="取药方案"><button aria-pressed={mode === 'noPurchase'} className={mode === 'noPurchase' ? 'selected' : ''} onClick={() => setMode('noPurchase')}>不自购<span>推荐</span></button><button aria-pressed={mode === 'purchase'} className={mode === 'purchase' ? 'selected' : ''} onClick={() => setMode('purchase')}>允许自购</button></div>
        {mode === 'purchase' && <p className="purchase-note" role="status">自购方案尚未计算。以下仍是医院取药示例，不会自动购买或增加库存。</p>}
        <p className="plan-caption">以 2026 年 10 月 13 日为固定虚构演示日期；计划不代表真实取药建议。</p>
        <Planner medications={medications} onOpenMedication={openMedication} />
        <details className="all-visits"><summary>完整取药安排 <span>4 次 · 展开</span></summary><div className="visit-list">{visits.map(([date, day, name, reason, status], index) => <article className="visit" key={date}><div className="visit-marker" aria-hidden="true"><i /></div><div className="visit-content"><div className="visit-date"><h2>{date}<span>{day}</span></h2><span className={index < 2 ? 'attention' : ''}>{status}</span></div><h3>{name}</h3><p>{reason}</p>{index === 0 && <details className="visit-details"><summary>查看取药详情 <span aria-hidden="true">⌄</span></summary><p>示例领取量：28 片。现有库存预计还能用 6 天，提前安排取药，避免断药。</p><p>出发前请确认药房开放时间，以及实际可领取的日期和数量。</p></details>}</div></article>)}</div></details>
      </>}
      {page === 'medications' && <>
        <div className="section-heading medication-heading"><span>共 {medications.length} 种 · 优先关注库存偏低</span><button className="add-button" onClick={() => dialog.current?.showModal()}><Icon name="plus" size={19} />添加</button></div>
        <div className="medication-list">{medications.map(med => <button className={`med-row ${med.risk}`} key={med.id} onClick={() => openMedication(med)} aria-label={`查看${med.name}详情`}><span className="med-main"><strong className="med-name">{med.name}</strong><span className="med-meta">{med.strength}</span><span className="med-status">{med.risk === 'critical' ? '! 库存偏低' : med.risk === 'soon' ? '即将需要关注' : med.risk === 'unknown' ? '资料待补充 · 未加入计划' : '库存充足'}</span></span><span className="med-stock">{med.risk === 'unknown' ? <span>待补充</span> : <><strong>{med.days}<span> 天</span></strong><span className="med-meta">{shortDate(finishDate(med)!)}吃完</span></>}<span className="med-detail-link">详情 ›</span></span></button>)}</div>
      </>}
      <footer><p>仅辅助管理取药日程，请遵医嘱用药。</p><details><summary>演示数据 · 使用说明</summary><p>不提供诊断、处方或剂量建议。医院开放时间须自行确认。当前未接入真实库存与调度，新增药品仅在本次页面中保留，刷新后恢复示例。</p></details></footer>
    </main>
    <nav className="bottom-nav" aria-label="主导航">{([['today', 'grid', '今天'], ['plan', 'calendar', '计划'], ['medications', 'pill', '药品']] as const).map(([id, icon, label]) => <button key={id} aria-current={page === id ? 'page' : undefined} className={page === id ? 'active' : ''} onClick={() => navigate(id)}><span className="nav-icon"><Icon name={icon} size={23} /></span><span>{label}</span></button>)}</nav>
    <dialog ref={medicationDialog} className="modal medication-sheet" aria-labelledby="medication-title" onClose={() => setSelectedMed(null)} onClick={event => { if (event.target === medicationDialog.current) medicationDialog.current?.close() }}>
      {selectedMed && <><div className="sheet-handle" aria-hidden="true" /><div className="section-heading"><h2 id="medication-title">{selectedMed.name}</h2><button className="close-button" aria-label="关闭药品详情" onClick={() => medicationDialog.current?.close()}>×</button></div><p className="sheet-strength">{selectedMed.strength}</p>
        <div className="dose-record"><span className="detail-label">示例用量 · 虚构数据</span><strong>{selectedMed.perDose !== undefined && selectedMed.timesDaily !== undefined ? `每日 ${selectedMed.timesDaily} 次，每次 ${selectedMed.perDose} ${selectedMed.unit}` : '尚未记录'}</strong><small>虚构示例，仅展示记录界面，不构成用药建议。</small></div>
        <dl className="medication-facts"><div><dt>示例库存</dt><dd>{selectedMed.risk === 'unknown' ? '待补充' : `${selectedMed.stock} ${selectedMed.unit} · 约 ${selectedMed.days} 天`}</dd></div><div className="finish-fact"><dt>示例预计用完日</dt><dd>{selectedFinish ? shortDate(selectedFinish) : '资料不足，暂无法估算'}{selectedFinish && <small>含今天，最后可完整使用的一天</small>}</dd></div><div><dt>计划取药</dt><dd>{selectedPickup ? shortDate(selectedPickup.date) : '尚未安排'}</dd></div><div><dt>示例基准日</dt><dd>{selectedMed.risk === 'unknown' ? '待补充' : '2026年10月13日'}</dd></div></dl>
        <p className="sheet-note">预计日期按记录用量和现有库存推算。请遵医嘱用药，不提供诊断、处方或剂量建议。</p><form className="pickup-form" onSubmit={recordPickup}><label htmlFor="pickup-quantity">实际取药数量（{selectedMed.unit}）</label><input id="pickup-quantity" type="number" min="0.001" step="0.001" value={pickupQuantity} onChange={event => setPickupQuantity(event.target.value)} required /><button className="save-button" type="submit">记录本次取药</button>{pickupMessage && <p className="pickup-success" role="status">{pickupMessage}</p>}</form><button className="secondary-button" onClick={() => medicationDialog.current?.close()}>关闭</button></>}
    </dialog>
    <dialog ref={dialog} className="modal" aria-label="添加药品" onClick={event => { if (event.target === dialog.current) dialog.current?.close() }}><form onSubmit={addMedication}><div className="section-heading"><h2>添加药品</h2><button className="close-button" type="button" aria-label="关闭" onClick={() => dialog.current?.close()}>×</button></div><label htmlFor="medicine-name">药品名称</label><input id="medicine-name" autoFocus required maxLength={60} value={newName} onChange={event => setNewName(event.target.value)} placeholder="请输入药盒上的名称" /><p>本版先保存名称，规格与库存待补充，暂不参与取药计划。</p><button type="submit" className="save-button">保存药品</button></form></dialog>
  </div>
}
export default App
