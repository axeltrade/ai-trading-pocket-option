const symbol = "AUDJPY";
const interval = "1m";

async function fetchKlines(symbol, interval, limit=100) {
  const res = await fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if(!res.ok) throw new Error("Failed to fetch klines");
  const data = await res.json();
  return data.map(k => ({
    time: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4])
  }));
}

function SMA(data, period=14) {
  const sma = [];
  for(let i=0; i < data.length; i++) {
    if(i < period -1) {
      sma.push(null);
      continue;
    }
    const slice = data.slice(i - period + 1, i +1);
    const sum = slice.reduce((a,b) => a + b.close, 0);
    sma.push(sum / period);
  }
  return sma;
}

function RSI(data, period=14) {
  const rsis = [];
  let gain = 0;
  let loss = 0;
  for(let i=1; i<data.length; i++) {
    const change = data[i].close - data[i-1].close;
    if(i <= period) {
      if(change > 0) gain += change;
      else loss -= change;
      rsis.push(null);
    } else if(i === period + 1) {
      const avgGain = gain / period;
      const avgLoss = loss / period;
      const rs = avgGain / avgLoss;
      rsis.push(100 - (100 / (1 + rs)));
    } else {
      const currentGain = change > 0 ? change : 0;
      const currentLoss = change < 0 ? -change : 0;
      gain = (gain * (period -1) + currentGain) / period;
      loss = (loss * (period -1) + currentLoss) / period;
      const rs = gain / loss;
      rsis.push(100 - (100 / (1 + rs)));
    }
  }
  return rsis;
}

function getSignal(data, sma, rsi) {
  const lastIdx = data.length -1;
  const price = data[lastIdx].close;
  const smaVal = sma[lastIdx];
  const rsiVal = rsi[lastIdx];

  if(!smaVal || !rsiVal) return "Waiting...";

  if(price > smaVal && rsiVal > 70) return "SELL";
  if(price < smaVal && rsiVal < 30) return "BUY";
  return "WAIT";
}

async function updateSignal() {
  try {
    const data = await fetchKlines(symbol, interval);
    const sma = SMA(data);
    const rsi = RSI(data);
    const signal = getSignal(data, sma, rsi);

    document.getElementById("signal").textContent = signal;
    document.getElementById("updated").textContent = "Updated at: " + new Date().toLocaleTimeString();
  } catch(e) {
    document.getElementById("signal").textContent = "Error fetching data";
    console.error(e);
  }
}

updateSignal();
setInterval(updateSignal, 60000);
