import $ from 'jquery'
/**
 * 请求wfs方法
 */

const requestWfsService = (url, options = {}) => {
    const param = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: options.layer || null,
        outputFormat: 'application/json',
        maxFeatures: 10000
    };

    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: 'GET',
            data: $.param(param),
            dataType: 'json',
            success: (data) => {
                resolve(data)
            },
            error: (error) => {
                reject(error)
            }
        });
    });
}

export { requestWfsService }