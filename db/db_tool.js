let SQLite3 = require('sqlite3').verbose();
const path_tool = require('path');
function getDB() {
    let db=new SQLite3.Database(path_tool.resolve(__dirname,'./print.db'));
    return db;
}

/**
 * 封装db.run()方法
 * @param {*} sql 要执行的sql语句
 */
const runSQL = async function (sql) {
    let db = getDB();
    let pro = new Promise((res, rej) => {
        db.run(sql, err => {
            if (err)
                return rej(err)
            res()
        })
    })
    let result
    try {
        await pro;
        db.close();
        return
    } catch (error) {
        console.log("数据库出错", error);
        db.close();
        throw error;
    }
};

/**
 * 封装db.exec()方法
 * @param {*} sql 要执行的sql语句
 */
const execSQL = async function (sql) {
    let db = getDB();
    let pro = new Promise((res, rej) => {
        db.exec(sql, err => {
            if (err)
                return rej(err)
            res()
        })
    })
    let result
    try {
        await pro;
        db.close();
        return
    } catch (error) {
        console.log("数据库出错", error);
        db.close();
        throw error;
    }
};

/**
 * 封装db.all()方法
 * @param {*} sql 要执行的sql语句
 */
const allSQL = async function (sql) {
    console.log(sql);
    let db = getDB();
    let pro = new Promise((res, rej) => {
        db.all(sql, (err, result) => {
            if (err)
                return rej(err)
            res(result)
        })
    })
    let result;
    try {
        result = await pro;
        db.close();
        return result
    } catch (error) {
        console.log("数据库出错", error);
        db.close();
        throw error;
    }
};

module.exports = {
    runSQL,
    execSQL,
    allSQL
}