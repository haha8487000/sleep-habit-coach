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
        <h1>💤 Sleep-Habit Coach</h1>
        <p>Track your sleep & habits</p>
      </header>

      <div className="grid">
        <div className="card form-card">
          <h2>Log Tonight</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Hours Slept:
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
              <legend>Bedtime Routine:</legend>
              <label className="checkbox">
                <input type="checkbox" checked={meditation} onChange={(e) => setMeditation(e.target.checked)} />
                Meditated
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={noScreen} onChange={(e) => setNoScreen(e.target.checked)} />
                No screens after 9pm
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={blueLight} onChange={(e) => setBlueLight(e.target.checked)} />
                Blue light filter on
              </label>
            </fieldset>

            <label>
              Morning Mood:
              <input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(parseInt(e.target.value))} />
              <span>{['😴', '😑', '😐', '🙂', '😄'][mood - 1]}</span>
            </label>

            <button type="submit">Log Sleep</button>
          </form>
        </div>

        <div className="card chart-card">
          <h2>7-Day Trend</h2>
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
            <p className="empty">No data yet. Start logging!</p>
          )}
        </div>

        <div className="card insight-card">
          <h2>Insights</h2>
          {logs.length > 0 ? (
            <>
              {meditationLogs.length > 0 && (
                <p>
                  <strong>With Meditation:</strong> {avgWithMeditation}h avg ({meditationLogs.length} days)
                </p>
              )}
              {noMeditationLogs.length > 0 && (
                <p>
                  <strong>Without Meditation:</strong> {avgWithoutMeditation}h avg ({noMeditationLogs.length} days)
                </p>
              )}
              <p>
                <strong>Meditation Streak:</strong> {streak} days 🔥
              </p>
              <p className="diff">
                {!canCompare ? (
                  'Still gathering data. Record both meditation and non-meditation days to compare patterns.'
                ) : !hasEnoughData ? (
                  'Not enough data yet. Log at least 3 days with and without meditation to see patterns.'
                ) : avgWithMeditation > avgWithoutMeditation ? (
                  `In your current records, meditation days average ${avgWithMeditation}h vs ${avgWithoutMeditation}h without meditation.`
                ) : (
                  `In your current records, non-meditation days average ${avgWithoutMeditation}h vs ${avgWithMeditation}h with meditation.`
                )}
              </p>
            </>
          ) : (
            <p className="empty">Log a few days to see patterns</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
