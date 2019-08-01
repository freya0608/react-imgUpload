const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const router = new Router();
const cors = require('koa-cors');
const fs=require('fs');
const _ =  require('lodash');
const path = require('path');
const multiparty = require('multiparty');

const statics = require('koa-static');

const staticPath = './build';


app.use(statics(
    path.join(__dirname,staticPath)
));
app.use(statics('.'));


app.use(bodyParser());

app.use(async (ctx,next) =>{
    console.log(`${ctx.request.method} ${ctx.request.url}`); // 打印URL
    await next(); // 调用下一个middleware
});


app.use(async(ctx, next) => {
    await next();
    ctx.response.type = 'text/html';
    // ctx.response.body = '<h1>Hello,koa2222!</h1>';
    //   console.log('ctx use',ctx.url,ctx.method);
    if(ctx.method === 'GET'){ //当请求时GET请求时
        ctx.body =ctx.response.body;
    }else if(ctx.url==='/' && ctx.method === 'POST'){ //当请求时POST请求时
        ctx.body=await parsePostData(ctx);
    }else{
        //其它请求显示404页面
        ctx.body='<h1>404!</h1>';
    }

});


router.post('/upload',  async(ctx, next) => { //提交图片接口
    // console.log('ctx.request',ctx.request.body);

    var form = new multiparty.Form({uploadDir: './files/'});
    // 上传完成后处理
    form.parse(ctx.req, function(err, fields, files) {
        if (err) {
            throw err;
        } else {
            //form.append ()的值在fields中
            processImg(ctx.req, ctx.res, files,fields).then(function(data) {
                console.log('hshsh')
                // 设置跨域
                // allowCross(ctx);
                // res.json({
                //     res: JSON.parse(data.filesTmp),
                //     relPath: data.relPath,
                // })
            }).catch(function(err) {
                console.log(err)
            });
        }
    });

});

function processImg(req, res, files,fields) {
    return new Promise(function(resolve, reject) {
        const _img = files.filedata[0];
        // console.log('_img',_img);
        const uploadedPath = _img.path;
        const originalFilename = _img.originalFilename;
        // console.log('uploadedPath',uploadedPath);

        // console.log('path.join(baseURL,\'activity/\'+fields.fileName+(fields.isBaDa?\'/page1.txt\':\'/page.txt\')',path.join(baseURL,'activity/'+fields.fileName+(isBaDa?'/page1.txt':'/page.txt')))
        let dstPath = './imgs/'+ originalFilename;
        // console.log('dstPath',dstPath);
        //  (目前的路径，重命名后的路径)重命名
        fs.rename(uploadedPath, dstPath, function(err) {
            if (err) {
                reject(err)
            } else {
                console.log('rename ok!');
            }
        });
    });
}






router.options('*', async(ctx, next) => {
    // 设置跨域
    allowCross(ctx);
    next();
});

function parsePostData( ctx ) {
    return new Promise((resolve, reject) => {
        try {
            let postdata = "";
            ctx.req.addListener('data', (data) => {
                postdata += data
            })
            ctx.req.addListener("end",function(){
                let parseData = parseQueryStr( postdata );
                resolve( parseData )
            })
        } catch ( err ) {
            reject(err)
        }
    })
}
function parseQueryStr( queryStr ) {
    let queryData = {};
    let queryStrList = queryStr.split('&');
    console.log( queryStrList );
    for (  let [ index, queryStr ] of queryStrList.entries()  ) {
        let itemList = queryStr.split('=');
        queryData[ itemList[0] ] = decodeURIComponent(itemList[1])
    }
    return queryData
}


function allowCross(ctx) {
    ctx.header('Access-Control-Allow-Origin', '*');
    ctx.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    ctx.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    ctx.header("X-Powered-By",' 3.2.1');
    ctx.header("Content-Type", "application/json;charset=utf-8");
}




app.use(cors());
app.use(router.routes());

app.listen(9000);
