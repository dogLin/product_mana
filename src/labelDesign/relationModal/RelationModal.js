import React, { Component } from 'react';
import { Modal, Select } from 'antd'
const Option = Select.Option

class RelationModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            type: "deviceProp",
            relationProp: 'printType'
        }
    }
    types = [
        {
            id: 'deviceProp',
            value: '设备属性'
        },
        {
            id: 'rule',
            value: '规则'
        },
    ]
    devicePropertys = [
        {
            id: 'printType',
            value: '设备型号'
        },
        {
            id: 'printName',
            value: '设备名称'
        },
        {
            id: 'mac',
            value: 'MAC地址'
        },
    ]

    onOk = e=> {
        let {type, relationProp} = this.state
        
        let data={};
        data.type = type;
        if (data.type == 'deviceProp') {
          data.relationProp = this.devicePropertys.find(item => item.id === relationProp);
        }
        this.props.onOk.call(this.props,data)
    }
    render() {
        //  onOk={this.handleOk} onCancel={this.handleCancel}
        const { visible, onOk, onCancel } = this.props
        let {type, relationProp} = this.state
        return (
            <Modal title="设置关联规则" visible={visible} onOk = {this.onOk} onCancel = {onCancel}
            >
                <div>关联到：</div>
                <Select value={this.state.type} onChange={(e) => { this.setState({ type: e }) }}>
                    {
                        this.types.map(type =>
                            <Option value={type.id} key={type.id}>
                                {type.value}
                            </Option>
                        )
                    }
                </Select>
                {
                    this.state.type === "deviceProp" ?
                    <div>
                        <div>设备属性：</div>
                        <Select value={this.state.relationProp} onChange={(e) => { this.setState({ relationProp: e }) }}>
                            {
                                this.devicePropertys.map(type =>
                                    <Option value={type.id} key={type.id}>
                                        {type.value}
                                    </Option>
                                )
                            }
                        </Select>
                    </div> :
                    <div>
                        <div>规则为:</div>
                        "型号+年+月+日+打印编号"。如"320020180321001".编号自增
                    </div>
                }
            </Modal>
        );
    }
}

export default RelationModal;