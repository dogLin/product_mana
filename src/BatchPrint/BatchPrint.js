import React, { Component } from 'react';
import style from './BatchPrint.less'
import { Link } from 'react-router-dom';
class BatchPrint extends Component {
    constructor(props) {
        super(props)
        console.log("组件batchPrint初始化")
    }

    render() {
        return (
            <div className={style.border}>
                <Link className={style.item} to = '/print/device'>
                    <i className={style.icon + " iconfont icon-yinxiang"}></i>
                    <span>设备打印</span>
                </Link>
                <Link className={style.item} to = '/print/box'>
                    <i className={style.icon + " iconfont icon-box1"}></i>
                    <span >纸箱打印</span>
                </Link>
            </div>
        );
    }
}

export default BatchPrint;