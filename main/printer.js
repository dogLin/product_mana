const { ipcMain,app, BrowserWindow, } = require('electron')

const dbTool = require("../db/db_tool")
const fs = require("fs")

const PrinterAPI = {

    /**
     * 获取所有打印模板
     */
    getAllPrintTemplate: async () => {
        let result = await dbTool.allSQL("select * from c_printtemp");
        return result
    },

    /**
     * 更改或者添加打印模板
     */
    updatePrintTemplate: async (temp) => {
        try {
            temp.elements = JSON.stringify(temp.elements);
            let sql
            if (temp.iid) {
                sql = `UPDATE c_printtemp
                SET name = '${temp.name}', width = '${temp.width}', height = '${temp.height}', dpi = '${temp.dpi}', elements = '${temp.elements}', url = '${temp.url}'
                WHERE iid = ${temp.iid}`;
            } else {
                sql = `insert into c_printtemp (name, width, height, dpi, url, elements, type)
                VALUES ("${temp.name}", "${temp.width}", "${temp.height}", "${temp.dpi}", "${temp.url}", '${temp.elements}', '${temp.type}');`;
            }
            await dbTool.runSQL(sql)
            return {
                success: true,
            }
        } catch (error) {
            return {
                success: false,
                msg: error
            }
        }
    },

    /**
     * 批量打印
     */
    batchPrint: async (data) => {
        let { urls } = data
        urls.map(async url => {
            let base64Data = url.replace(/^data:image\/\w+;base64,/, "");
            let dataBuffer = Buffer.from(base64Data, "base64")
            let date = new Date();
            let saveURL = `${__dirname}\\printimage\\${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}`
            fs.writeFileSync(saveURL + ".png", dataBuffer);
        })
        winprintp = new BrowserWindow({ width: 1000, height: 800 });
        winprintp.loadURL(`file://${__dirname}/printimage/index.html`);
        winprintp.setMenu(null);
        winprintp.webContents.on('did-finish-load', () => {
            winprintp.webContents.send('urls', urls);
        });
        winprintp.webContents.openDevTools()
    }

}



/**
 * 为所有的方法注册通讯事件
 */
for (let key in PrinterAPI) {
    console.log(key);
    ipcMain.on(key, async (event, args) => {
        let result = await PrinterAPI[key](args)
        event.sender.send(key + '-reply', result)
    })
}
