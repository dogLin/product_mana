import React, { Component } from 'react';
import stl from './LabelDesign.less';
import { TextElement, BarcodeElement, QrcodeElement, ImageElement } from './desiner-elements'
import { getRelativeMouse } from "../util/eventUtil"
import { Button, Select, Input, Tooltip } from "antd"
import RelationModal from './relationModal/RelationModal'
import NewImage from './newimage/NewImage'

const Option = Select.Option;
const Tools = [
    {
        id: "text",
        icon: "icon-text",
        title: "文字",
        obj: TextElement
    },
    {
        id: "barcode",
        icon: "icon-barcodescan",
        title: "条形码",
        obj: BarcodeElement
    },
    {
        id: "qrcode",
        icon: "icon-qrcode-scan",
        title: "二维码",
        obj: QrcodeElement
    },
    {
        id: "image",
        icon: "icon-photo",
        title: "图片"
    }
]

const propertyType = {
    x: {
        type: "number",
        title: "x坐标"
    },
    y: {
        type: "number",
        title: "y坐标"
    },
    height: {
        type: "number",
        title: "高度"
    },
    width: {
        type: "number",
        title: "宽度"
    },
    text: {
        type: "text",
        title: "内容"
    },
    fontSize: {
        type: "number",
        title: "字体大小"
    },
    maxwidth: {
        type: "number",
        title: "最大宽度"
    },
    format: {
        type: "array",
        title: "格式",
        array: [
            "CODE128",
            "CODE39",
            "MSI"
        ],
    },
    relation: {
        type: "text",
        title: "关联规则",
    },
}


class LabelDesign extends Component {
    dpi = 300
    height = 26.3;
    width = 66;
    activeElement;
    elements = [];

    // 鼠标上一个停留点
    dragLastPosition = { x: 0, y: 0 }

    // 鼠标与激活元素的偏移点
    dragElementOffset = { x: 0, y: 0 }
    currentTool;

    set activeElement(obj) {
        this.setState({ activeElement: obj }, () => {
            if (obj) {
                this.dragElementOffset = {
                    x: obj.x - this.dragLastPosition.x,
                    y: obj.y - this.dragLastPosition.y,
                }
            }
            this.updateCanvas()
        })
    }

    get activeElement() {
        return this.state.activeElement
    }

    set currentTool(obj) {
        this.setState({ currentTool: obj })
    }

    get currentTool() {
        return this.state.currentTool
    }

    constructor(props) {
        super(props)
        if (props.type && props.type == 'box') {

        }
        this.state = {
            activeElement: null,
            newImageVisable: false,
            relationVisible: false
        }
    }
    componentDidMount() {
        this.canvas = document.getElementById("canvas");
        this.drawingContext = this.canvas.getContext("2d")
        this.init(this.props);
    }

    componentWillReceiveProps(nexProps) {
        this.init(nexProps)
    }

    init(props) {
        let { template } = props
        if (!template || template === null || (this.props.template && template.iid === this.props.template.iid))
            return
        this.height = template.height
        this.width = template.width
        this.elements = template.elements
        this.dpi = template.dpi
        if (this.elements && this.elements.length > 0) {
            this.elements = this.elements.map(item => {
                let newObj
                if (item.type) {
                    switch (item.type) {
                        // TextElement, BarcodeElement, QrcodeElement, ImageElement
                        case "TextElement":
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
            console.log(this.elements);
        }
        this.setState({ activeElement: null }, () => {
            this.updateCanvas()
        })
    }

    /**
     * 设置编辑元素
     */
    setActiveElement(e) {
        var coordinates = getRelativeMouse(e, this.canvas);
        this.activeElement = null;
        for (let i = this.elements.length; i >= 0; i--) {
            if (this.elements[i] && this.elements[i].hitTest(coordinates)) {
                this.activeElement = this.elements[i];
                break;
            }
        }
        this.updateCanvas();
    }

    /**
     * 更新画布
     */
    updateCanvas() {
        // 清空画板
        this.drawingContext.fillStyle = '#fff';
        this.drawingContext.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // 画子元素
        this.elements.map(item => {
            item.draw(this.drawingContext)
        })

        // 为激活元素画边框
        if (this.activeElement) {
            this.drawingContext.strokeStyle = 'rgb(146, 187, 226)';
            this.drawingContext.lineCap = 'butt';
            this.drawingContext.lineWidth = 2;
            this.activeElement.drawActive(this.drawingContext);
        }
    }

    /**
     * 点击canvas
     * @param {*} e 
     */
    clickCanvas(e) {
        this.setActiveElement(e);
    }

    /**
     * canvas的mousedown事件
     * @param {*} e 
     */
    mouseDownCanvas(e) {
        console.log(this.dragLastPosition, "=====>before");
        var dragStartPosition = getRelativeMouse(e, this.canvas);
        this.dragLastPosition = dragStartPosition;
        console.log(this.dragLastPosition, "=====>after");
        let newTool = Tools.find(item => item.id === this.currentTool)
        // 如果当前为新建模式
        if (newTool) {
            this.elements.push(new newTool.obj(dragStartPosition.x, dragStartPosition.y, 1, 1));
            this.activeElement = this.elements[this.elements.length - 1];

            this.currentTool = '';
            console.log(this.elements);
            this.updateCanvas()
        }
        // 不是新建模式
        else {
            // 设置激活编辑元素
            this.setActiveElement(e);

            if (this.activeElement) {
                this.dragElementOffset = {
                    x: this.activeElement.x - dragStartPosition.x,
                    y: this.activeElement.y - dragStartPosition.y,
                }
            }
        }
        this.dragging = true;
    }

    /**
     * 鼠标松开
     * @param e
     */
    mouseUpCanvas(e) {
        this.dragging = false;
    }

    /**
     * 鼠标离开
     * @param e
     */
    mouseOutCanvas(e) {
        this.dragging = false;
    }

    mouseMoveCanvas(e) {
        if (this.dragging && this.activeElement) {
            let coords = getRelativeMouse(e, this.canvas);

            // 移动激活元素
            this.move(coords.x + this.dragElementOffset.x, coords.y + this.dragElementOffset.y);
            this.updateCanvas()
            this.dragLastPosition = coords
        }
    }

    // 改变激活元素的x,y坐标值
    move(x, y) {
        this.activeElement.x = x;
        this.activeElement.y = y;
    }

    /**
     * 点击工具栏
     */
    clickTool(item) {
        if (item.id === "image") {
            this.currentTool = ''
            this.setState({ newImageVisable: true })
            return
        }
        if (item.id === this.currentTool) {
            this.currentTool = ''
        } else {
            this.currentTool = item.id
        }
    }

    /**
     * 删除元素
     */
    deleteActive() {
        this.elements = this.elements.filter(item => item !== this.activeElement)
        this.setState({ activeElement: null }, () => {
            this.updateCanvas()
        });
    }

    propSlectChange(item, e) {
        console.log(e, item)
        let a = this.activeElement;
        a[item] = e;
        this.activeElement = a;
        this.updateCanvas();
    }

    selectRelation(key, item) {
        if (key === 'relation') {
            console.log(key)
            this.setState({ relationVisible: true })
        }
    }

    propertyChange(e, item) {
        this.activeElement[item] = e.target.value;
        this.activeElement = this.activeElement
        this.updateCanvas()
    }

    /**
     * 插入图片
     */
    insertImage = (e) => {
        console.log(e)
        this.elements.push(new ImageElement(5, 5, e.width, e.height, e.img_url));
        this.activeElement = this.elements[this.elements.length - 1];
        this.updateCanvas()
        this.setState({ newImageVisable: false })
    }

    relationOnOk = (e) => {
        console.log(e)
        let data = e
        let item = this.activeElement
        if (data.type == "deviceProp") {
            item.relation = data.relationProp.value;
            switch (data.relationProp.id) {
                case "printType":
                    item.text = 'PT-3290C'
                    break;
                case "mac":
                    item.text = '14:2b:9a:00:00:01'
                    break;
                case "printName":
                    item.text = '网络数字前置功率放大器'
                    break;
                default:
                    break;
            }
        } else {
            item.relation = "流水号";
            item.text = '327020180321001'
        }
        this.updateCanvas();
        this.setState({ relationVisible: false })
    }

    render() {
        let tools = Tools.map(tool => {
            return (
                <Tooltip key={tool.id} title={tool.title} placement="right" >
                    <i className={"iconfont " + tool.icon + ' ' + stl.tool_icon}
                        onClick={this.clickTool.bind(this, tool)}
                        style={{ color: tool.id === this.currentTool ? 'red' : '#92bbe2' }}
                    ></i>
                </Tooltip>
            )
        })
        let propList
        if (this.activeElement) {
            propList = this.activeElement.getKeys().map((item, i) => {
                let content;
                if (propertyType[item] && propertyType[item].type === 'array') {
                    content = (
                        <Select id={item} value={this.activeElement[item]} style={{ width: 120 }} onChange={this.propSlectChange.bind(this, item)}>

                            {propertyType[item].array.map((item1, index) => {
                                return <Option key={index} value={item1}>{item1}</Option>
                            })}
                        </Select>
                    )
                }

                if (!propertyType[item] || propertyType[item].type === 'number' || propertyType[item].type === 'text') {
                    content = (
                        <Input id={item}
                            type={propertyType[item] ? propertyType[item].type : 'text'}
                            value={this.activeElement[item]}
                            // onKeyUp={(e) => {console.log(e.target.value);this.updateCanvas.bind(this)}}
                            onChange={(e) => this.propertyChange(e, item)}
                            readOnly={this.activeElement.disable && this.activeElement.disable.indexOf(item) >= 0}
                            onClick={this.selectRelation.bind(this, item, this.activeElement)}
                        />
                    )
                }
                return (
                    <div className={stl.prperty_item} key={i}>
                        <label htmlFor={item}>{propertyType[item] ? propertyType[item].title : item}</label>
                        {content}
                    </div>
                )
            })
        }

        // (mouseup)='OnMouseUp($event)' (mouseout)='OnMouseOut($event)' (mousemove)='OnMouseMove($event)' click='OnClick($event)'
        return (
            <div className={stl.design}>
                <div className={stl.left}>
                    <div className={stl.tool_title}>
                        工具栏
                         </div>
                    <div className={stl.tool_content}>
                        {tools}
                    </div>
                </div>
                <canvas id='canvas'
                    className={stl.canvas}
                    width={this.width * this.dpi / 25.4}
                    height={this.height * this.dpi / 25.4}
                    onClick={this.clickCanvas.bind(this)}
                    onMouseDown={this.mouseDownCanvas.bind(this)}
                    onMouseUp={this.mouseUpCanvas.bind(this)}
                    onMouseOut={this.mouseOutCanvas.bind(this)}
                    onMouseMove={this.mouseMoveCanvas.bind(this)}
                >
                </canvas>
                <div className={stl.right}>
                    <div className={stl.right_title}>
                        属性栏
                        </div>
                    {propList}
                    <div>
                        {this.activeElement && <Button icon='icon-shanchu' className={stl.delete} onClick={this.deleteActive.bind(this)}>删除</Button>}
                    </div>
                </div>
                <NewImage visible={this.state.newImageVisable} onOk={this.insertImage} onCancel={e => { this.setState({ newImageVisable: false }) }}></NewImage>
                <RelationModal visible={this.state.relationVisible} onOk={this.relationOnOk} onCancel={e => { console.log(e); this.setState({ relationVisible: false }) }}></RelationModal>
            </div >
        );
    }
}

export default LabelDesign;