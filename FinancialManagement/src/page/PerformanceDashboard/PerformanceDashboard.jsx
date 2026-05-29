import React, { useState, useEffect } from 'react'
import { getMetrics, getLastApiCalls, resetMetrics, generateDemoMetrics } from '../../api/performanceMetrics'
import './PerformanceDashboard.scss'

export default function PerformanceDashboard() {
    const [metrics, setMetrics] = useState(getMetrics())
    const [apiCalls, setApiCalls] = useState(getLastApiCalls(20))
    const [autoRefresh, setAutoRefresh] = useState(true)

    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(() => {
            setMetrics(getMetrics())
            setApiCalls(getLastApiCalls(20))
        }, 1000)

        return () => clearInterval(interval)
    }, [autoRefresh])

    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key !== 'performanceMetrics') return
            setMetrics(getMetrics())
            setApiCalls(getLastApiCalls(20))
        }

        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const handleReset = () => {
        resetMetrics()
        setMetrics(getMetrics())
        setApiCalls([])
    }

    return (
        <div className="performance-dashboard">
            <div className="performance-header">
                <h1>🚀 Демонстрация производительности</h1>
                <div className="performance-controls">
                    <button
                        className={`btn ${autoRefresh ? 'active' : ''}`}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? '⏸' : '▶'} Auto-refresh
                    </button>
                    <button className="btn btn-reset" onClick={handleReset}>
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Основные метрики */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-label">Всего запросов</div>
                    <div className="metric-value">{metrics.totalRequests}</div>
                    <div className="metric-desc">API вызовов</div>
                </div>

                <div className="metric-card cache-hits">
                    <div className="metric-label">Попадания в кэш</div>
                    <div className="metric-value">{metrics.cacheHits}</div>
                    <div className="metric-desc">{metrics.cacheHitRate} от всех запросов</div>
                </div>

                <div className="metric-card network">
                    <div className="metric-label">Сетевые запросы</div>
                    <div className="metric-value">{metrics.networkRequests}</div>
                    <div className="metric-desc">Реальные запросы на сервер</div>
                </div>

                <div className="metric-card uptime">
                    <div className="metric-label">Время работы сессии</div>
                    <div className="metric-value">{(metrics.uptime / 1000).toFixed(1)}s</div>
                    <div className="metric-desc">Время работы приложения</div>
                </div>
            </div>

            {/* Детальная статистика кеша */}
            <div className="cache-stats-section">
                <h2>Статистика кэша</h2>
                <div className="cache-breakdown">
                    <div className="cache-item">
                        <span className="cache-type">Memory Cache</span>
                        <span className="cache-count">{metrics.cacheStats.memory}</span>
                    </div>
                    <div className="cache-item">
                        <span className="cache-type">localStorage</span>
                        <span className="cache-count">{metrics.cacheStats.localStorage}</span>
                    </div>
                    <div className="cache-item">
                        <span className="cache-type">Network</span>
                        <span className="cache-count">{metrics.cacheStats.network}</span>
                    </div>
                </div>

                {/* Диаграмма кеша */}
                <div className="cache-chart">
                    {metrics.totalRequests > 0 && (
                        <>
                            <div
                                className="chart-bar memory"
                                style={{ width: `${(metrics.cacheStats.memory / metrics.totalRequests) * 100}%` }}
                            >
                                {metrics.cacheStats.memory > 0 && (
                                    <span>{((metrics.cacheStats.memory / metrics.totalRequests) * 100).toFixed(0)}%</span>
                                )}
                            </div>
                            <div
                                className="chart-bar localStorage"
                                style={{ width: `${(metrics.cacheStats.localStorage / metrics.totalRequests) * 100}%` }}
                            >
                                {metrics.cacheStats.localStorage > 0 && (
                                    <span>{((metrics.cacheStats.localStorage / metrics.totalRequests) * 100).toFixed(0)}%</span>
                                )}
                            </div>
                            <div
                                className="chart-bar network"
                                style={{ width: `${(metrics.cacheStats.network / metrics.totalRequests) * 100}%` }}
                            >
                                {metrics.cacheStats.network > 0 && (
                                    <span>{((metrics.cacheStats.network / metrics.totalRequests) * 100).toFixed(0)}%</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Последние API вызовы */}
            <div className="api-calls-section">
                <h2>Последние вызовы API</h2>
                <div className="api-calls-list">
                    {apiCalls.length === 0 ? (
                        <div className="no-calls-block">
                            <p className="no-calls">Пока нет вызовов API. Перейдите по разным маршрутам приложения, чтобы увидеть запросы.</p>
                            {/* <button className="btn btn-demo" onClick={() => {
                                generateDemoMetrics()
                                setMetrics(getMetrics())
                                setApiCalls(getLastApiCalls(20))
                            }}>
                                🔥 Generate demo data
                            </button> */}
                        </div>
                    ) : (
                        <table className="api-calls-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>URL</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiCalls.map((call, idx) => (
                                    <tr key={idx} className={`call-${call.type}`}>
                                        <td>
                                            <span className={`badge badge-${call.type}`}>
                                                {call.type === 'memory' && '⚡ Memory'}
                                                {call.type === 'localStorage' && '💾 Storage'}
                                                {call.type === 'network' && '🌐 Network'}
                                            </span>
                                        </td>
                                        <td className="url">{call.url}</td>
                                        <td className="time">
                                            {new Date(call.timestamp).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
