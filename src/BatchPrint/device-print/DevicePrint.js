import React, { Component } from 'react';
import { Input, Button, Select, message, Modal } from 'antd'
import LabelDesign from '../../labelDesign/LabelDesign'
import ElecUtil from '../../util/electron'
import stl from './DevicePrint.less'
import PrintModal from './PrintModal'
import { TextElement, BarcodeElement, QrcodeElement, ImageElement } from '../../labelDesign/desiner-elements'
const Option = Select.Option

const { $, Promise } = window


class DevicePrint extends Component {
    printOrder = 0;
    constructor(props) {
        super(props)
        this.state = {
            template: {},
            templates: [],
            name: '',
            saveAsName: '',
            saveAsVisible: false,
            printVisible: false
        }
    }
    componentWillMount() {
        console.log("xxx")
        this.init()
    }

    init() {
        ElecUtil.ipcGet("getAllPrintTemplate").then(res => {
            res.map(temp => temp.elements = JSON.parse(temp.elements))
            this.setState({ templates: res.filter(item => item.type === 'device') })
            let a = this.state.templates[this.state.templates.length - 1]
            if (a) {
                this.setState({ template: a })
                this.setState({ name: a.name })
            }
        })
    }

    save(e) {
        // console.log(this.refs.childComponent.elements)
        let temp = this.state.template;
        temp.name = this.state.name
        this.saveOrUpdate(temp)
    }

    saveOrUpdate(temp) {
        if (!temp.name) {
            return message.error("模板名字不能为空")
        }
        temp.elements = this.refs.childComponent.elements
        temp.dpi = this.refs.childComponent.dpi
        temp.height = this.refs.childComponent.height
        temp.width = this.refs.childComponent.width
        temp.url = this.refs.childComponent.canvas.toDataURL()
        temp.type = 'device'
        ElecUtil.ipcGet("updatePrintTemplate", temp).then(res => {
            if (res.success) {
                message.success("保存成功")
                this.init()
            }
        })
    }


    saveAsOk = (e) => {
        let temp = this.state.template;
        temp.name = this.state.saveAsName
        delete temp.iid
        this.saveOrUpdate(temp)
        this.saveAsCancel(e)
    }

    saveAsCancel = (e) => {
        this.setState({
            saveAsVisible: false,
            saveAsName: ''
        })
    }

    selectChange = (e) => {
        console.log(e)
        let temp = this.state.templates.find(a => a.iid === e)
        this.setState({
            template: temp,
            name: temp.name
        })
    }

    /**
     * 获取设备的打印流水号
     * @param device 设备
     */
    getPrintOrder = () => {
        let order = this.printOrder + 1;
        let l = 3 - (order + '').length;
        for (let i = 0; i < l; i++) {
            order = '0' + order;
        }
        let a = new Date();
        a.toISOString();
        this.printOrder++;
        return new Date().toISOString().split('T')[0].split("-").join('') + order;
    }

    print = () => {
        this.setState({ printVisible: true })
    }

    printOk = e => {
        console.log(e)
        let { template } = this.state
        let { num, printer } = e;
        let cols = 3;
        let rows = 11;
        let paperLength = Math.ceil(num / (cols * rows)) //打印这些数量需要几张纸
        let imgUrls = []
        let allContents = [];
        // 实例化模板中的元素类型，为元素赋予draw方法
        if (template.elements && template.elements.length > 0) {
            template.elements = template.elements.map(item => {
                let newObj
                if (item.type) {
                    switch (item.type) {
                        // TextElement, BarcodeElement, QrcodeElement, ImageElement
                        case "TextElement":
                            BarcodeElement
                            newObj = new TextElement(item.x, item.y, item.width, item.height);
                            break;
                        case "BarcodeElement":
                            newObj = new BarcodeElement(item.x, item.y, item.width, item.height);
                            break;
                        case "QrcodeElement":
                            newObj = new QrcodeElement(item.x, item.y, item.width, item.height);
                            break;
                        case "ImageElement":
                            newObj = new ImageElement(item.x, item.y, item.width, item.height, item.imgUrl);
                            break;
                        default:
                            break;
                    }
                    let keys = Object.keys(item);
                    keys.map(key => {
                        newObj[key] = item[key];
                    })
                    return newObj;
                }
            })
            console.log(template.elements);
        }
        for (let i = 0; i < num; i++) {
            let a = template.elements.map(item2 => {
                let element = Object.create(item2)
                if (element.relation) {
                    switch (element.relation) {
                        case "流水号":
                            element.text = this.getPrintOrder()
                            break;
                        default:
                            break;
                    }
                }
                return element;
            })
            allContents.push(a)
        }

        for (let p = 0; p < paperLength; p++) {
            let contents = allContents.splice(0, cols * rows)
            imgUrls.push(this.getImage(contents))
        }
        Promise.all(imgUrls).then((urls) => {
            ElecUtil.ipcGet("batchPrint", { urls }).then(
                res => {
                    console.log(res)
                }
            )

            this.setState({ printVisible: false })
        })

    }

    getImage(contents) {
        let { template } = this.state
        let dpi = 300;
        let widthmm = 210;
        let heightmm = 297;
        let width = widthmm * dpi / 25.4;
        let height = heightmm * dpi / 25.4;
        let left = 3.5 * dpi / 25.4;
        let top = 0 * dpi / 25.4;
        let marLeft = 3 * dpi / 25.4;
        let OneHeight = Math.ceil(template.height * template.dpi / 25.4)
        let OneWidth = Math.ceil(template.width * template.dpi / 25.4);
        let cols = 3;
        let rows = 11;
        let allLength = contents.length * template.elements.length
        let nowLength = 0;
        var canvas = $("<canvas></canvas>").prop("width", width).prop("height", height)
            .css({ "position": "absolute", "z-index": -1, "top": "0px", "left": "0px", "opacity": "0" }).appendTo(document.body);
        let ctx = canvas[0].getContext("2d");
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height)
        return new Promise((res, rej) => {
            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    if (j * cols + i < contents.length) {
                        let x = i * (OneWidth + marLeft) + left;
                        let y = j * (OneHeight) + top;
                        contents[j * cols + i].map((item, index) => {
                            item.x = item.x + x;
                            item.y = item.y + y;
                            item.draw(ctx, () => {
                                nowLength++;
                                // 全部画完开始生成url预览
                                if (nowLength == allLength) {
                                    // 打开预览
                                    let url = canvas[0].toDataURL()
                                    res(url)
                                }
                            })
                        })
                    }
                }
            }
        })
    }

    render() {
        let { template, name } = this.state
        return (
            <div className={stl.content}>
                <div className={stl.header}>
                    <label htmlFor="temList">模板列表</label>
                    <Select id='temList' value={template && template.iid} onChange={this.selectChange}>
                        {
                            this.state.templates.map(item =>
                                <Option key={item.iid} value={item.iid}>{item.name}</Option>
                            )
                        }
                    </Select>
                    <label htmlFor="name">模板名称</label>
                    <Input
                        value={name} id='name'
                        style={{ width: '100px', marginRight: "20px" }}
                        onChange={e => { this.setState({ name: e.target.value }) }}
                    ></Input>
                    <Button type='primary' style={{ marginRight: "20px" }} onClick={this.save.bind(this)}> 保存</Button>
                    <Button type='primary' style={{ marginRight: "20px" }} onClick={(e) => this.setState({ saveAsVisible: true })}> 另存为</Button>
                    <Button type='primary' onClick={this.print}> 打印</Button>
                    <Modal
                        title="模板另存为"
                        visible={this.state.saveAsVisible}
                        onOk={this.saveAsOk}
                        onCancel={this.saveAsCancel}
                    >
                        <Input value={this.state.saveAsName} onChange={e => this.setState({ saveAsName: e.target.value })}></Input>
                    </Modal>
                    <PrintModal visible={this.state.printVisible} onOk={this.printOk} onCancel={e => this.setState({ printVisible: false })}></PrintModal>
                </div>
                <LabelDesign template={this.state.template} type="device" ref="childComponent" />
            </div>
        );
    }
}

export default DevicePrint;