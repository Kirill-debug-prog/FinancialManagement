/**
 * Performance Metrics Tracker
 * Отслеживает кеш-попадания, API запросы, время загрузки
 */

const STORAGE_KEY = 'performanceMetrics'

const metrics = {
    cacheHits: 0,
    networkRequests: 0,
    totalRequests: 0,
    apiCalls: [],
    cacheStats: {
        memory: 0,
        localStorage: 0,
        network: 0,
    },
    startTime: Date.now(),
}

function persistMetrics() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
    } catch (error) {
        console.warn('[performanceMetrics] Could not persist metrics:', error)
    }
}

function loadMetricsFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') {
            metrics.cacheHits = parsed.cacheHits || 0
            metrics.networkRequests = parsed.networkRequests || 0
            metrics.totalRequests = parsed.totalRequests || 0
            metrics.apiCalls = Array.isArray(parsed.apiCalls) ? parsed.apiCalls : []
            metrics.cacheStats = {
                memory: parsed.cacheStats?.memory || 0,
                localStorage: parsed.cacheStats?.localStorage || 0,
                network: parsed.cacheStats?.network || 0,
            }
            metrics.startTime = parsed.startTime || Date.now()
        }
    } catch (error) {
        console.warn('[performanceMetrics] Could not load metrics:', error)
    }
}

function syncMetricsFromStorage(event) {
    if (!event || event.key !== STORAGE_KEY) return
    loadMetricsFromStorage()
}

if (typeof window !== 'undefined') {
    loadMetricsFromStorage()
    window.addEventListener('storage', syncMetricsFromStorage)
}

/**
 * Зафиксировать попадание в кеш (память)
 */
export function recordMemoryCacheHit(url) {
    metrics.cacheHits++
    metrics.cacheStats.memory++
    metrics.totalRequests++
    metrics.apiCalls.push({
        url,
        type: 'memory',
        timestamp: Date.now(),
    })
    console.log(`[Cache] Memory hit: ${url}`)
    persistMetrics()
}

/**
 * Зафиксировать попадание в кеш (localStorage)
 */
export function recordLocalCacheHit(url) {
    metrics.cacheHits++
    metrics.cacheStats.localStorage++
    metrics.totalRequests++
    metrics.apiCalls.push({
        url,
        type: 'localStorage',
        timestamp: Date.now(),
    })
    console.log(`[Cache] localStorage hit: ${url}`)
    persistMetrics()
}

/**
 * Зафиксировать сетевой запрос
 */
export function recordNetworkRequest(url) {
    metrics.networkRequests++
    metrics.cacheStats.network++
    metrics.totalRequests++
    metrics.apiCalls.push({
        url,
        type: 'network',
        timestamp: Date.now(),
    })
    console.log(`[Network] Request: ${url}`)
    persistMetrics()
}

/**
 * Получить текущие метрики
 */
export function getMetrics() {
    return {
        ...metrics,
        uptime: Date.now() - metrics.startTime,
        cacheHitRate: metrics.totalRequests > 0
            ? ((metrics.cacheHits / metrics.totalRequests) * 100).toFixed(2) + '%'
            : '0%',
    }
}

/**
 * Сбросить метрики
 */
export function resetMetrics() {
    metrics.cacheHits = 0
    metrics.networkRequests = 0
    metrics.totalRequests = 0
    metrics.apiCalls = []
    metrics.cacheStats = { memory: 0, localStorage: 0, network: 0 }
    metrics.startTime = Date.now()
    persistMetrics()
}

/**
 * Сгенерировать демонстрационные метрики для презентации
 */
export function generateDemoMetrics() {
    resetMetrics()

    const sampleCalls = [
        { url: '/api/dashboard', type: 'network' },
        { url: '/api/accounts', type: 'network' },
        { url: '/api/accounts', type: 'localStorage' },
        { url: '/api/transactions', type: 'memory' },
        { url: '/api/categories', type: 'memory' },
    ]

    sampleCalls.forEach((call) => {
        if (call.type === 'network') {
            metrics.networkRequests++
            metrics.cacheStats.network++
            metrics.totalRequests++
            metrics.apiCalls.push({
                url: call.url,
                type: 'network',
                timestamp: Date.now() - Math.floor(Math.random() * 300000),
            })
        }

        if (call.type === 'localStorage') {
            metrics.cacheHits++
            metrics.cacheStats.localStorage++
            metrics.totalRequests++
            metrics.apiCalls.push({
                url: call.url,
                type: 'localStorage',
                timestamp: Date.now() - Math.floor(Math.random() * 200000),
            })
        }

        if (call.type === 'memory') {
            metrics.cacheHits++
            metrics.cacheStats.memory++
            metrics.totalRequests++
            metrics.apiCalls.push({
                url: call.url,
                type: 'memory',
                timestamp: Date.now() - Math.floor(Math.random() * 100000),
            })
        }
    })
    persistMetrics()
}

/**
 * Получить последние N API вызовов
 */
export function getLastApiCalls(count = 20) {
    return metrics.apiCalls.slice(-count).reverse()
}
