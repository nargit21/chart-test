import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

// Initialize Highcharts modules
HC_exporting(Highcharts);

const exchangeList = ['binance', 'coinbase-exchange', 'upbit', 'bybit', 'gate-io', 'kucoin', 'okx', 'mexc', 'lbank', 'bitmart', 'bithumb', 'bitget', 'htx'];

async function getChart() {
    try {
        const time_start = new Date();
        time_start.setMonth(time_start.getMonth() - 6);
        const time_end = new Date();
        const query = {
            CMC_PRO_API_KEY: '8d137727-077e-47d6-8fe2-4b6d0533788a',
            interval: 'daily',
            time_start: time_start.getTime(),
            time_end: time_end.getTime(),
            slug: exchangeList.join(','),
        };

        const response = await axios.post(`https://dev6api.coinstats.app/proxy`, {
            url: `https://pro-api.coinmarketcap.com/v1/exchange/quotes/historical?${new URLSearchParams(query).toString()}`,
        });
        return response.data.data;
    } catch (error) {
        console.error(error);
    }
}

async function getData() {
    const allData = [];

    const res = await getChart();

    for (const exchange in res) {
        const chart = res[exchange].quotes;

        const data = {
            name: exchange,
            data: chart.map(({ timestamp, quote }) => [new Date(timestamp).getTime(), quote.USD.volume_24h]),
            tooltip: {
                valueDecimals: 0,
            },
        };

        allData.push(data);
    }

    console.log(allData);
    allData.sort((a, b) => b.data[b.data.length - 1][1] - a.data[a.data.length - 1][1]);
    return allData;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

    return <div>{isLoading ? <div>Loading...</div> : data.map((el) => <MyChart data={[el]} />)}</div>;
};

const MyChart = ({ data }) => {
    const options = {
        chart: {
            height: 900,
            scrollablePlotArea: {
                minWidth: 700,
            },
        },
        series: data,
        title: {
            text: capitalizeFirstLetter(`${data[0].name} Volume`),
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
                text: 'Volume (USD)',
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
