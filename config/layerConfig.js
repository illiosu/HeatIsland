const GEOSERVER_URL = `http://localhost:8080/geoserver`
const LAYER_CONFIG = {
    wmsLayers: [
        {
            name: '合肥市行政边界',
            url: `${GEOSERVER_URL}/hefei/wms`,
            layers: 'hefei:hefei_line',
            visible: true
        },
        {
            name: '合肥市2013年温度',
            url: `${GEOSERVER_URL}/hefei/wms`,
            layers: 'hefei:20163857'
        },
        {
            name: '合肥市2016年温度',
            url: `${GEOSERVER_URL}/hefei/wms`,
            layers: 'hefei:20163857'
        },
        {
            name: '合肥市2018年温度',
            url: `${GEOSERVER_URL}/hefei/wms`,
            layers: 'hefei:hefei2018'
        },
        {
            name: '合肥市2019年温度',
            url: `${GEOSERVER_URL}/hefei/wms`,
            layers: 'hefei:hefei2019'
        }
    ],
    wfsLayers: [
        {
            id: 'qx',
            name: '区县',
            url: `${GEOSERVER_URL}/hefei/wfs`,
            layer: 'hefei:heifeiqx',
        }
    ]
}

export default LAYER_CONFIG