import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const TradingChart = () => {
  const [series, setSeries] = useState([{
    data: [] // Format: [{x: timestamp, y: [o,h,l,c]}, ...]
  }]);
  const [connected, setConnected] = useState(false);

  const options = {
    chart: {
      type: 'candlestick',
      height: 400,
      animations: {
        enabled: false
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        }
      }
    },
    title: {
      text: 'BTC/USD Live Chart',
      align: 'left'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#26C281',
          downward: '#ED1C24'
        }
      }
    }
  };

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080/ws');
    
    websocket.onopen = () => {
      console.log('Connected to websocket');
      setConnected(true);
    };

    websocket.onmessage = (event) => {
      const candle = JSON.parse(event.data);
      setSeries(prevSeries => {
        const newData = [...prevSeries[0].data, {
          x: candle.x,
          y: [candle.o, candle.h, candle.l, candle.c]
        }].slice(-50); // Keep last 50 candles

        return [{
          data: newData
        }];
      });
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    websocket.onclose = () => {
      console.log('Disconnected from websocket');
      setConnected(false);
    };

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Crypto Trading</h2>
        <span className={`text-sm px-3 py-1 rounded-full ${
          connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="mb-6">
        <ReactApexChart
          options={options}
          series={series}
          type="candlestick"
          height={400}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Last Price</div>
          <div className="text-xl font-bold text-gray-800">
            ${series[0].data[series[0].data.length - 1]?.y[3]?.toFixed(2) || '-'}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Open</div>
          <div className="text-xl font-bold text-gray-800">
            ${series[0].data[series[0].data.length - 1]?.y[0]?.toFixed(2) || '-'}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">High</div>
          <div className="text-xl font-bold text-gray-800">
            ${series[0].data[series[0].data.length - 1]?.y[1]?.toFixed(2) || '-'}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Low</div>
          <div className="text-xl font-bold text-gray-800">
            ${series[0].data[series[0].data.length - 1]?.y[2]?.toFixed(2) || '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
