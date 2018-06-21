import React, { Component } from 'react';
import ElecUtil from '../../util/electron'
class BoxPrint extends Component {
    constructor(props) {
        super(props)
        ElecUtil.ipcGet("getPrinters").then(
            res => console.log(res)
        )
    }
    render() {
        return (
            <div>
                纸箱打印
            </div>
        );
    }
}

export default BoxPrint;