import React, { Component } from 'react';
import { Modal, Select, Input } from 'antd'
import  ElecUtil from '../../util/electron'
const Option = Select.Option

class PrintModal extends Component {
    printers = []
    
    constructor(props) {
        super(props)
        this.state = {
            num: 1,
            printer: ''
        }

    }
    
    
    componentWillMount() {
    }

    render() {
        const { visible, onOk, onCancel } = this.props
        return (
            <Modal title='打印选项' visible={visible}
                onOk={e=> {this.setState({num:1});onOk(this.state)}} onCancel={e => {this.setState({num:1});onCancel(e)}}
            >
                <label htmlFor="num">打印数量</label>
                <Input type='number' value={this.state.num} id= 'num' onChange={e => this.setState({num:e.target.value})} ></Input>
                
            </Modal>
        );
    }
}

export default PrintModal;