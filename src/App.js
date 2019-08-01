import React from 'react';
import logo from './logo.svg';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import './App.css';


import {  withStyles, makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  input: {
    margin: theme.spacing(1),
    display: 'none',
  },
  margin: {
    margin: theme.spacing(1),
  },
  gridList: {
    width: 500,
    height: 300,
  },
}));
function App() {
  const classes = useStyles();
  const [values, setValues] = React.useState({
    age: '',
    images:[],
    uploadHistory:[],
  });

  function uploadImg(e) {
    e.preventDefault();
    let target = e.target;
    let files = target.files;
    let count = files.length;
    for (let i = 0; i < count; i++) {
      files[i].thumb = URL.createObjectURL(files[i])
    }
    // convert to array
    //Array.prototype.slice.call(arguments)能将具有length属性的对象(key值为数字)转成数组。[]是Array的示例，所以可以直接使用[].slice（）方法。
    files = Array.prototype.slice.call(files, 0);
    files = files.filter(function (file) {
      return /image/i.test(file.type)
    });
    setValues(oldValues => ({
      ...oldValues,
      images: values.images.concat(files)
    }));

  }

  const deleteImg = (e) => {

    let index = e.target.getAttribute('data-index');
    let result = values.images.splice(index,1);

    setValues(oldValues => ({
      ...oldValues,
      images: values.images
    }));
  };

  function handleProgress(file, loaded, total, idx) {
    let percent = (loaded / total * 100).toFixed(2) + '%';
    let _progress = this.state.progress;
    _progress[idx] = percent;
    console.log(_progress);
    this.setState({ progress: _progress })
  }
  function handleSuccess(file, res) {
    console.log('handleSuccess',res)
    setValues(oldValues => ({
      ...oldValues,
      uploadHistory: [...values.uploadHistory, JSON.parse(res)]
    }));
  }
  function handleComplete() {
    console.log('upload complete！');
  }
  function handleFailure(file, res) {
    console.log(res);
  }
  function handleUpload() {
    for (let i = 0, file; file = values.images[i]; i++) {
      ((file) => {
        let xhr = new XMLHttpRequest();
        if (xhr.upload) {
          // 上传中
          console.log('上传中')
          xhr.upload.addEventListener("progress", (e) => {
            // handleProgress(file, e.loaded, e.total, i);
          }, false);

          // 文件上传成功或是失败
          xhr.onreadystatechange = (e) => {
            if (xhr.readyState == 4) {
              if (xhr.status == 200) {
                console.log('handleSuccess'  ,file )
                // handleSuccess(file, xhr.responseText);
                // this.handleDeleteFile(file);

                if (!values.images.length) {
                  //全部完毕
                  handleComplete();
                  console.log('全部上传完成！');
                }
              } else {
                handleFailure(file, xhr.responseText);
                console.log('上传出错！');
              }
            }
          };

          const form = new FormData();
          form.append("filedata", file);
          // 开始上传
          xhr.open("POST", "/upload", true);
          // xhr.setRequestHeader("FILENAME", file.name);
          console.log('form',form);
          xhr.send(form);
        }
      })(file)
    }
  }
  return (
    <div className="App">
      {/*<header className="App-header">*/}
      {/*  <img src={logo} className="App-logo" alt="logo" />*/}
      {/*</header>*/}
      <form action="/upload"  method="post" encType="multipart/form-data" style={{width:'100%'}}>
        <div>
          <input
              accept="image/*"
              className={classes.input}
              id="contained-button-file"
              multiple
              type="file"
              onChange={uploadImg}

          />
          <label htmlFor="contained-button-file">
            <Button variant="contained"
                    component="span"
                    className={classes.button}
            >
              添加图片
            </Button>
          </label>
          <GridList cellHeight={100} className={classes.gridList} cols={3}>
            {/*{console.log('html',values.images&&values.images)}*/}
            { values.images && values.images.map((item,index) => (
                <GridListTile key={index}
                              cols={item.cols || 1}
                              data-index = {index}
                >

                  <strong>{item.name}</strong>
                  <a href="javascript:void(0)"
                     className="upload-delete"
                     title="删除"
                     data-index = {index}
                     onClick={deleteImg}
                  >删除{index}</a>
                  <br/>
                  <img src={item.thumb} />
                </GridListTile>
            ))}

          </GridList>

        </div>
      </form>
      {
        values.images &&values.images.length ?

            <Button variant="contained"
                    color="primary"
                    style={{height:'40px',width:'20%'}}
                    className={classes.margin}
                    onClick={() => handleUpload()}>
              上传图片
            </Button>:''
      }
    </div>
  );
}

export default App;
