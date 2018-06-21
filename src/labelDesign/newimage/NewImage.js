import React, { Component } from 'react';
import { Modal, Button, Input } from 'antd';
import stl from './NewImage.less'

class NewImage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            width: null,
            height: null,
            img_url: null
        }
    }
    handleOk = () => {

    }
    handleCancel = () => {

    }

    FileChange = (e) => {
        this.setState({width : null})
        this.setState({height : null})
        let file = e.target.files[0];
        var reader = new FileReader();
        let img = window.$("#insertImage")
        reader.onloadend = () => {
          img[0].onload = () => {
            this.setState({width : img[0].width})
            this.setState({height : img[0].height})
          }
          this.setState({img_url: reader.result})
        }
        reader.readAsDataURL(file);
    }
    
    clear = (e) => {
        this.setState({
            width: null,
            height: null,
            img_url: null
        })
    }

    render() {
        const { visible } = this.props;
        const { width, height, img_url} = this.state;
        return (
            <Modal title="插入图片"
                visible={visible}
                onOk={(e) => {this.props.onOk({width, height, img_url}); this.clear()}}
                // confirmLoading={confirmLoading}
                onCancel={(e) => {this.props.onCancel(e); this.clear()}}
            >
                <div className={stl.outer}>
                    <div >
                        <label htmlFor="width">宽度:</label>
                        <Input type="number" value={width} id='width' onChange = {e => this.setState({width: e.target.value})}/>
                        <label htmlFor="height">高度:</label>
                        <Input type="number" value={height} id='height' onChange = {e => this.setState({height: e.target.value})}/>
                    </div>
                    <div className={stl.image}>
                        <label htmlFor="image">
                            {
                                !img_url && <i className='iconfont icon-tianjia' style={{ fontSize: "40px" }} ></i> 
                            
                            }
                            <img alt="" src={img_url} style={{ width: width ? width + "px" : "", height: height ? height + "px" : "" }} id='insertImage' />
                        </label>
                        <input type="file" id='image' onChange={this.FileChange} accept="image/*" />
                    </div>
                </div>
            </Modal>
        );
    }
}
export default NewImage