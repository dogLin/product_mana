import React, { Component } from 'react';
import { Tabs } from 'antd';
import { withRouter, Route } from "react-router-dom";
import BatchPrint from '../BatchPrint/BatchPrint'
import DevicePrint from '../BatchPrint/device-print/DevicePrint'
import BoxPrint from '../BatchPrint/box-print/BoxPrint'

const TabPane = Tabs.TabPane;
const electron = window.require('electron');
const ipc = electron.ipcRenderer
console.log(ipc)

class Main extends Component {
    constructor(props) {
        super(props)
        this.state = { activeKey: "1" };
        ipc.on('asynchronous-reply', function (event, arg) {
            const message = `异步消息回复: ${arg}`
            alert(message)
        })
    }

    componentDidMount() {

    }
    componentWillReceiveProps() {
    }

    change(e) {
        let path
        switch (e) {
            case "1":
                path = '/print'
                break;
            default:
                break;
        }
        this.props.history.push(path);
    }

    render() {
        return (
            <Tabs size='large' className='full_height' onChange={this.change.bind(this)}>
                <TabPane className='full_height' tab="批量打印" key="1">
                    <Route exact path='/' component={BatchPrint}></Route>
                    <Route exact path='/print' component={BatchPrint}></Route>
                    <Route path='/print/device' component={DevicePrint}></Route>
                    <Route path='/print/box' component={BoxPrint}></Route>
                </TabPane>
                <TabPane tab="批量烧写" key="2">Content of Tab Pane 2</TabPane>
                <TabPane tab="局域网内打印" key="3">Content of Tab Pane 3</TabPane>
            </Tabs>
        );
    }
}

export default withRouter(Main);
