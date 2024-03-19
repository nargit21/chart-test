import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

// Initialize Highcharts modules
HC_exporting(Highcharts);

async function getChart(exchange, fromCoin) {
    const response = await axios.get(`https://api.coin-stats.com/v2/candle_chart?type=3m&fromCoin=${fromCoin}&toCoin=USDT&exchange=${exchange}`);
    return response.data.candleChart;
}

const exchanges = [{ name: 'Bybit' }, { name: 'Kucoin' }, { name: 'Gate.io' }, { name: 'Mexc' }, { name: 'OKEX' }];

const coins = [
    {
        fromCoin: 'MEE',
    },
    {
        fromCoin: 'VR',
    },
    {
        fromCoin: 'NADA',
    },
    {
        fromCoin: 'ORNJ',
    },
    {
        fromCoin: 'XCH',
    },
];

async function getData() {
    const allData = [];

    for (const coin of coins) {
        const data = await Promise.all(
            exchanges.map(async (exchange) => {
                const chart = await getChart(exchange.name, coin.fromCoin);
                return {
                    name: exchange.name,
                    data: chart.map(([date, start, end, min, max]) => [date * 1000, end]),
                    tooltip: {
                        valueDecimals: 8,
                    },
                };
            })
        );

        allData.push({
            coin: coin.fromCoin,
            data,
        });
    }

    console.log(allData);
    return allData;
}

const App = () => {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const data = await getData();
            setData(data);
            setLoading(false);
        }
        fetchData();
    }, []);

    return <div>{isLoading ? <div>Loading...</div> : data.map(({ coin, data }) => <MyChart coin={coin} data={data} />)}</div>;
};

const MyChart = ({ data, coin }) => {
    const options = {
        chart: {
            height: 1000,
            scrollablePlotArea: {
                minWidth: 700,
            },
        },
        series: data,
        title: {
            text: ` ${coin} coin prices`,
            align: 'left',
        },
        // subtitle: {
        //     text: ` in ${exchange} exchange`,
        //     align: 'left',
        // },
        xAxis: {
            type: 'datetime',
            showLastTickLabel: true,
            maxZoom: 14 * 24 * 3600000, // fourteen days
            plotBands: [
                {
                    id: 'mask-before',
                    from: data[0][0],
                    to: data[data.length - 1][0],
                    color: 'rgba(0,0,255,0.05)',
                },
            ],
            title: {
                text: null,
            },
        },

        // xAxis: {
        //     tickInterval: 7 * 24 * 3600 * 1000, // one week
        //     tickWidth: 0,
        //     gridLineWidth: 1,
        //     labels: {
        //         align: 'left',
        //         x: 3,
        //         y: -3,
        //     },
        // },
        yAxis: {
            title: {
                text: 'Price',
            },
            labels: {
                style: {
                    fontSize: '20px',
                },
            },
        },
        legend: {
            align: 'left',
            verticalAlign: 'top',
            borderWidth: 0,
        },
        tooltip: {
            shared: true,
            crosshairs: true,
            style: {
                fontSize: '22px', // Increase tooltip font size
            },
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                className: 'popup-on-click',
                marker: {
                    lineWidth: 1,
                },
                // point: {
                //     events: {
                //         click: handlePointClick,
                //     },
                // },
            },
        },
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};

export default App;
