var $ = window.$
var KaelQrcode = window.KaelQrcode
var JsBarcode = window.JsBarcode

/**
 * 画虚线长方形
 * @param ctx 画布内容
 * @param x 左上x
 * @param y 左上y
 * @param x2 右下x
 * @param y2 右下y
 * @param dashArray 虚线的间隔
 */
function dashedStrock(ctx, x, y, x2, y2, dashArray = [2, 2]) {
    ctx.setLineDash(dashArray)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x, y2);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([])
  }
  
  // 文本
  export class TextElement {
    x;  //x坐标
    y;  //y坐标
    maxwidth;
    width; //宽度
    height; //高度
    text; //文字内容
    fontSize;
    fontType;
    type = "TextElement";
    relation = "";
    disable = ["relation", "outheight", 'width', "height", "type"];
    outheight;
  
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.text = 'TextBox';
      this.fontSize = 36;
      this.fontType = 'Arial';
      this.width = 100;
      this.height = 0;
      this.maxwidth = null;
    }
  
    wrapText(context, text, x, y) {
      if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
        return;
      }
      var canvas = context.canvas;
  
      if (!this.maxwidth) {
        return context.fillText(text, x, y);
      }
  
      // 字符分隔为数组
      var arrText = text.split('');
      var line = '';
      for (var n = 0; n < arrText.length; n++) {
        var testLine = line + arrText[n];
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > this.maxwidth && n > 0) {
          context.fillText(line, x, y);
          line = arrText[n];
          y += this.height * 0.9;
          this.outheight += this.height * 0.9
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
    };
  
    getFontHeight() {
      let textMeasure = $("<div></div>").css({
        "font-size": this.fontSize + "px",
        "font-family": this.fontType,
        "opacity": 0,
      }).text("M").appendTo($("body"));
  
      let height = textMeasure.outerHeight();
      textMeasure.remove();
      return height;
    }
  
    draw(context, call) {
      context.font = this.fontSize + "px " + this.fontType;
      var oColor = context.fillStyle;
      context.fillStyle = "#000";
      this.height = this.getFontHeight();
      this.outheight = this.height
      var measuredText = context.measureText(this.text);
      this.width = measuredText.width;
      this.wrapText(context, this.text, parseInt(this.x, 10), parseInt(this.y, 10) + parseInt(this.height * 0.75 + '', 10))
      // context.fillText(this.text, parseInt(this.x), parseInt(this.y) + parseInt(this.height * 0.75 + ''),this.maxwidth);
      context.fillStyle = oColor;
      call && call();
    }
  
    /**
     * 判断坐标点是否在该元素上
     * @param coords 坐标点
     */
    hitTest(coords) {
      return (
        coords.x >= parseInt(this.x)
        && coords.x <= parseInt(this.x) + parseInt(this.width)
        && coords.y >= parseInt(this.y)
        && coords.y <= parseInt(this.y) + parseInt(this.height) * 0.75
      )
    }
  
    drawActive(ctx) {
      dashedStrock(ctx,
        parseInt(this.x) + 1,
        parseInt(this.y) + 1,
        parseInt(this.x) + parseInt(this.maxwidth || this.width),
        parseInt(this.y) + parseInt(this.outheight) - 1
      )
    }
    toZPL() {
      let result = ''
      return result;
    }
  
    getKeys() {
      let a = Object.keys(this)
      a.splice(a.indexOf("disable"), 1);
      return a;
    }
  }
  
  // 条形码
  export class BarcodeElement  {
    x;  //x坐标
    y;  //y坐标
    width; //宽度
    height; //高度
    text;
    scale;
    margin;
    format = "CODE128"
    type = "BarcodeElement";
    relation = "";
    disable = ["relation", "type", "width"];
    constructor(x, y, width, height, scale) {
      this.text = "123456789";
      this.x = x;
      this.y = y;
      this.width = 100;
      this.height = 100;
      this.scale = this.scale || 1.9;
      this.margin = 0;
    }
  
    draw(context, call) {
      console.log(this.text);
      var canvasHolder = $("<canvas></canvas>").prop("width", "100").prop("height", "100").appendTo(document.body)
      canvasHolder.JsBarcode(this.text, {
        width: Number(this.scale),
        height: this.height,
        margin: this.margin,
        format: this.format,
        fontOptions: "bold"
        // lineColor: '#ff0000'
      });
      var cwidth = canvasHolder[0].width;
      var cheight = canvasHolder[0].height;
      var ctx = canvasHolder[0].getContext('2d');
      this.width = cwidth;
      // this.height = cheight;
      var cData = ctx.getImageData(0, 0, cwidth, cheight);
      for (let j = 0; j < cheight; j++) {
        for (var i = 0; i < cwidth; i++) {
  
          let a = (j * cwidth + i) * 4
          context.fillStyle = `rgba(${cData.data[a]},${cData.data[a + 1]},${cData.data[a + 2]},${cData.data[a + 3]})`;
          context.fillRect(i + this.x, j + this.y, 1, 1);
          // }
        }
      }
      canvasHolder.remove();
      call && call();
    }
  
    hitTest(coords) {
      return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(this.width) && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height));
    }
    drawActive(context) {
      dashedStrock(context,
        parseInt(this.x) + 1,
        parseInt(this.y) + 1,
        parseInt(this.x) + parseInt(this.width) - 1,
        parseInt(this.y) + parseInt(this.height) - 1
      );
    }
    toZPL() {
      let result = ''
      return result;
    }
  
    getKeys() {
      let a = Object.keys(this)
      a.splice(a.indexOf("disable"), 1);
      return a;
    }
  }
  
  // 二维码
  export class QrcodeElement {
    x;  //x坐标
    y;  //y坐标
    size;
    text;
    type = "QrcodeElement";
    relation = "";
    disable = ["relation", "type"];
    constructor(x, y, width, height) {
      this.text = "19:4b:2a:00:00:01";
      this.x = x;
      this.y = y;
      this.size = 100;
    }
  
    draw(context, call) {
      console.log(this.text);
      var canvasHolder = $("<div></div>").appendTo(document.body)
      var kaelPic = new KaelQrcode();
      kaelPic.init(canvasHolder[0], {
        text: this.text,
        size: this.size,
      });
      var cwidth = canvasHolder[0].children[0].width;
      var cheight = canvasHolder[0].children[0].height;
      var ctx = canvasHolder[0].children[0].getContext('2d');
      var cData = ctx.getImageData(0, 0, cwidth, cheight);
      for (let j = 0; j < cheight; j++) {
        for (var i = 0; i < cwidth; i++) {
          let a = (j * cwidth + i) * 4
          context.fillStyle = `rgba(${cData.data[a]},${cData.data[a + 1]},${cData.data[a + 2]},${cData.data[a + 3]})`;
          context.fillRect(i + this.x, j + this.y, 1, 1);
        }
      }
      canvasHolder.remove();
      call && call();
    }
  
    hitTest(coords) {
      return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(this.size) && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.size));
    }
  
    drawActive(context) {
      dashedStrock(context,
        parseInt(this.x) + 1,
        parseInt(this.y) + 1,
        parseInt(this.x) + parseInt(this.size) - 1,
        parseInt(this.y) + parseInt(this.size) - 1
      );
    }
  
    toZPL() {
      let result = ''
      return result;
    }
  
    getKeys() {
      let a = Object.keys(this)
      a.splice(a.indexOf("disable"), 1);
      return a;
    }
  }
  
  // 图片
  export class ImageElement {
    x;  //x坐标
    y;  //y坐标
    width;
    height;
    imgUrl;
    type = "ImageElement";
    firsTime = true
    constructor(x, y, width, height, url) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.imgUrl = url;
    }
  
    draw(context, call) {
      if (call) {
        var img = new Image();
        img.src = this.imgUrl;
        img.setAttribute("crossOrigin", 'Anonymous')
        img.onload = () => {
          context.drawImage(img, parseInt(this.x + ''), this.y, Number(this.width), Number(this.height));
          call && call();
        }
      } else {
        var canvasHolder = $("<img />").prop("src", this.imgUrl).css({ width: this.width, height: this.height }).appendTo(document.body)
        setTimeout(() => {
          context.drawImage(canvasHolder[0], this.x, this.y, Number(this.width), Number(this.height));
          canvasHolder.remove();
        }, 10);
        context.drawImage(canvasHolder[0], this.x, this.y, Number(this.width), Number(this.height));
        canvasHolder.remove();
  
      }
    }
  
    hitTest(coords) {
      return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(this.width) && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height));
    }
  
    drawActive(context) {
      dashedStrock(context,
        parseInt(this.x) + 1,
        parseInt(this.y) + 1,
        parseInt(this.x) + parseInt(this.width) - 1,
        parseInt(this.y) + parseInt(this.height) - 1
      );
    }
  
    toZPL() {
      let result = ''
      return result;
    }
  
    getKeys() {
      return Object.keys(this)
    }
  }
  