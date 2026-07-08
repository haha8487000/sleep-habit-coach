import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

function App() {
  const [logs, setLogs] = useState([])
  const [sleepHours, setSleepHours] = useState('')
  const [meditation, setMeditation] = useState(false)
  const [noScreen, setNoScreen] = useState(false)
  const [blueLight, setBlueLight] = useState(false)
  const [mood, setMood] = useState(3)

  useEffect(() => {
    const stored = localStorage.getItem('sleepLogs')
    if (stored) setLogs(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('sleepLogs', JSON.stringify(logs))
  }, [logs])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!sleepHours) return
    const today = new Date().toISOString().split('T')[0]
    const newLog = {
      date: today,
      sleepHours: parseFloat(sleepHours),
      meditation,
      noScreen,
      blueLight,
      mood,
    }
    setLogs([...logs, newLog].slice(-7))
    setSleepHours('')
    setMeditation(false)
    setNoScreen(false)
    setBlueLight(false)
    setMood(3)
  }

  const chartData = logs.map(log => ({
    date: log.date.slice(5),
    sleep: log.sleepHours,
  }))

  const meditationLogs = logs.filter(l => l.meditation)
  const noMeditationLogs = logs.filter(l => !l.meditation)

  const avgWithMeditation = meditationLogs.length > 0
    ? (meditationLogs.reduce((sum, l) => sum + l.sleepHours, 0) / meditationLogs.length).toFixed(1)
    : 0

  const avgWithoutMeditation = noMeditationLogs.length > 0
    ? (noMeditationLogs.reduce((sum, l) => sum + l.sleepHours, 0) / noMeditationLogs.length).toFixed(1)
    : 0

  // 비교 가능 여부 확인
  const canCompare = meditationLogs.length > 0 && noMeditationLogs.length > 0
  const hasEnoughData = meditationLogs.length >= 3 && noMeditationLogs.length >= 3

  const streak = (() => {
    let count = 0
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].meditation) count++
      else break
    }
    return count
  })()

  return (
    <div className="app-container">
      <header>
        <h1>💤 숙면 습관 코치</h1>
        <p>수면과 습관을 기록해보세요</p>
      </header>

      <div className="grid">
        <div className="card form-card">
          <h2>오늘 밤 수면 기록</h2>
          <form onSubmit={handleSubmit}>
            <label>
              수면시간 (시간):
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                required
              />
            </label>

            <fieldset>
              <legend>취침 전 습관:</legend>
              <label className="checkbox">
                <input type="checkbox" checked={meditation} onChange={(e) => setMeditation(e.target.checked)} />
                명상했어요
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={noScreen} onChange={(e) => setNoScreen(e.target.checked)} />
                밤 9시 이후 화면 없음
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={blueLight} onChange={(e) => setBlueLight(e.target.checked)} />
                블루라이트 필터 켜기
              </label>
            </fieldset>

            <label>
              아침 기분:
              <input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(parseInt(e.target.value))} />
              <span>{['😴', '😑', '😐', '🙂', '😄'][mood - 1]}</span>
            </label>

            <button type="submit">기록하기</button>
          </form>
        </div>

        <div className="card chart-card">
          <h2>7일 변화</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty">아직 기록이 없습니다. 기록을 시작해보세요!</p>
          )}
        </div>

        <div className="card insight-card">
          <h2>분석</h2>
          {logs.length > 0 ? (
            <>
              {meditationLogs.length > 0 && (
                <p>
                  <strong>명상한 날:</strong> 평균 {avgWithMeditation}시간 ({meditationLogs.length}일)
                </p>
              )}
              {noMeditationLogs.length > 0 && (
                <p>
                  <strong>명상하지 않은 날:</strong> 평균 {avgWithoutMeditation}시간 ({noMeditationLogs.length}일)
                </p>
              )}
              <p>
                <strong>연속 명상:</strong> {streak}일 🔥
              </p>
              <p className="diff">
                {!canCompare ? (
                  '아직 비교할 기록이 부족합니다.\n며칠 더 기록해보세요.'
                ) : !hasEnoughData ? (
                  '아직 비교할 기록이 부족합니다.\n며칠 더 기록해보세요.'
                ) : avgWithMeditation > avgWithoutMeditation ? (
                  `현재 기록에 따르면 명상한 날의 평균 수면시간(${avgWithMeditation}시간)이 명상하지 않은 날(${avgWithoutMeditation}시간)보다 더 깁니다.`
                ) : (
                  `현재 기록에 따르면 명상하지 않은 날의 평균 수면시간(${avgWithoutMeditation}시간)이 명상한 날(${avgWithMeditation}시간)보다 더 깁니다.`
                )}
              </p>
            </>
          ) : (
            <p className="empty">며칠 더 기록해서 패턴을 확인해보세요</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
