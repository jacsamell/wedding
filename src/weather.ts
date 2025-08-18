const LATITUDE = -35.05;
const LONGITUDE = 138.58;
const TIMEZONE = 'Australia/Adelaide';
const WEDDING_DATE_ISO = '2026-03-21';

function formatDateISO(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}


function weatherCodeToEmojiAndLabel(code: number): { icon: string; label: string } {
    if ([0].includes(code)) return { icon: '☀️', label: 'Clear sky' };
    if ([1, 2].includes(code)) return { icon: '🌤️', label: 'Partly cloudy' };
    if ([3].includes(code)) return { icon: '☁️', label: 'Overcast' };
    if ([45, 48].includes(code)) return { icon: '🌫️', label: 'Fog' };
    if ([51, 53, 55].includes(code)) return { icon: '🌦️', label: 'Drizzle' };
    if ([56, 57].includes(code)) return { icon: '🌧️', label: 'Freezing drizzle' };
    if ([61, 63, 65].includes(code)) return { icon: '🌧️', label: 'Rain' };
    if ([66, 67].includes(code)) return { icon: '🌨️', label: 'Freezing rain' };
    if ([71, 73, 75, 77].includes(code)) return { icon: '❄️', label: 'Snow' };
    if ([80, 81, 82].includes(code)) return { icon: '🌧️', label: 'Rain showers' };
    if ([85, 86].includes(code)) return { icon: '❄️', label: 'Snow showers' };
    if ([95].includes(code)) return { icon: '⛈️', label: 'Thunderstorm' };
    if ([96, 99].includes(code)) return { icon: '⛈️', label: 'Thunderstorm with hail' };
    return { icon: '🌤️', label: 'Weather' };
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 7000): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

async function fetchForecastForDate(dateISO: string): Promise<{
    code: number;
    tMax: number | null;
    tMin: number | null;
    precipMm: number | null;
    precipProb: number | null;
} | null> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=${encodeURIComponent(TIMEZONE)}&forecast_days=16`;
    const data = await fetchJsonWithTimeout(url);
    const idx = (data?.daily?.time || []).indexOf(dateISO);
    if (idx === -1) return null;
    return {
        code: Number(data.daily.weathercode[idx]),
        tMax: data.daily.temperature_2m_max?.[idx] ?? null,
        tMin: data.daily.temperature_2m_min?.[idx] ?? null,
        precipMm: data.daily.precipitation_sum?.[idx] ?? null,
        precipProb: data.daily.precipitation_probability_max?.[idx] ?? null
    };
}

// removed climate-api normals (replaced by archive-based normals)

function renderLoading(container: HTMLElement): void {
    container.innerHTML = `
        <div class="weather-row">
            <div class="weather-icon">⏳</div>
            <div class="weather-meta">
                <div class="weather-label">Weather Forecast</div>
                <div class="weather-temps">Loading...</div>
            </div>
        </div>
    `;
}

function renderUnavailable(container: HTMLElement, _availableFrom: Date): void {
    container.innerHTML = `
        <div class="weather-row">
            <div class="weather-icon" aria-label="Typical conditions">☀️</div>
            <div class="weather-meta">
                <div class="weather-label">Weather Forecast</div>
                <div class="weather-temps">27° / 17°</div>
            </div>
        </div>
    `;
}

function renderForecast(container: HTMLElement, result: {
    code: number;
    tMax: number | null;
    tMin: number | null;
    precipMm: number | null;
    precipProb: number | null;
}): void {
    const { icon, label } = weatherCodeToEmojiAndLabel(result.code);
    const tMax = result.tMax != null ? `${Math.round(result.tMax)}°` : '—';
    const tMin = result.tMin != null ? `${Math.round(result.tMin)}°` : '—';
    container.innerHTML = `
        <div class="weather-row">
            <div class="weather-icon" aria-label="${label}">${icon}</div>
            <div class="weather-meta">
                <div class="weather-label">Weather Forecast</div>
                <div class="weather-temps">${tMax} / ${tMin}</div>
                <div class="weather-rain">${icon} ${label}</div>
            </div>
        </div>
    `;
}


export async function initWeather(): Promise<void> {
    const container = document.querySelector<HTMLElement>('#weather-widget');
    if (!container) return;
    const weddingDate = new Date(`${WEDDING_DATE_ISO}T00:00:00`);

    renderLoading(container);


    const targetISO = formatDateISO(weddingDate);
    try {
        const forecast = await fetchForecastForDate(targetISO);
        if (!forecast) {
            renderUnavailable(container, new Date());
            return;
        }
        renderForecast(container, forecast);
    } catch (e) {
        container.innerHTML = `
            <div class="weather-row">
                <div class="weather-icon">⚠️</div>
                <div class="weather-meta">
                    <div class="weather-label">Weather Forecast</div>
                    <div class="weather-temps">Unavailable</div>
                    <div class="weather-rain">Please try again later</div>
                </div>
            </div>
        `;
    }
}


