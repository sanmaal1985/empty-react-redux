'use strict';

import { RequestConf } from './AppConfig';

function sendRequest(method, url, data){
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest(),
            requestUrl = RequestConf.apiUrl + url;

        request.open(method, requestUrl, true);
        request.setRequestHeader('Content-Type', 'JSON');

        request.onreadystatechange = function(){
            if(this.readyState !== 4){
                return;
            }
            if(this.status !== 200){
                reject(this.statusText);
            }
            else{
                resolve(this.response)
            }
        }
        request.onerror = function(){
            reject(this.statusText);
        }
        request.send(data);
    });
}
export function getRequest(url, data){
    let newUrl = url[0] === '/' ? url : '/' + url;
    return sendRequest('GET', newUrl, data);
}
