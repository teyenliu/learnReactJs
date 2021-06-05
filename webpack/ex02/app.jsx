import React from 'react';
import ReactDOM from 'react-dom';
import jsplumb from 'jsplumb';
const jsPlumbIn = jsplumb.jsPlumb;
import $ from 'jquery';

import {Modal} from 'antd';
const {confirm} = Modal;


class Dotcon extends React.Component {
    componentDidMount() {
        var common = {
            isSource: true,
            isTarget: true,
            connector: ['Straight']
        }
        jsPlumbIn.ready(function () {
            jsPlumbIn.connect({
                connector: 'Flowchart',
                source: 'item_left',
                target: 'item_right',
                endpoint: 'Rectangle',
                paintStyle: { stroke: 'red', strokeWidth: 3 },
                endpointStyle: { fill: 'red', outlineStroke: 'darkgray', outlineWidth: 2 },
                overlays: [['Arrow', { width: 12, length: 12, location: 0.5 }]]
            })
            jsPlumbIn.addEndpoint('item_left', {
                anchors: ['Right']
            }, common)

            jsPlumbIn.addEndpoint('item_right', {
                anchor: 'Left'
            }, common)

            jsPlumbIn.addEndpoint('item_right', {
                anchor: 'Right'
            }, common)
        })
        jsPlumbIn.draggable('item_left')
        jsPlumbIn.draggable('item_right')
    }
    render() {
        let diagramContainer = {
            padding: '20px',
            width: '80%',
            height: '200px',
            border: '1px solid gray'
        };
        let item = {
            position: 'absolute',
            height: '80px',
            width: '80px',
            border: '1px solid blue',
            color: 'blue',
            float: 'left'
        };
        let leftPo = {
            position: 'absolute',
            height: '80px',
            width: '80px',
            border: '1px solid blue',
            color: 'blue',
            float: 'left',
            left: '150px'
        };
        return (
            <div className="Dotcon" style={diagramContainer}>
                <div id="item_left" style={item}></div>
                <div id="item_right" style={leftPo}></div>
            </div>
        );
    }
}

//空心圓端點樣式設置
let hollowCircle = {
    endpoint: ["Dot", { radius: 7 }], // 端點的形狀
    isSource: true, // 是否可以拖動（作為連線起點）
    connector: ["Flowchart", { stub: [0, 0], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
    // 連接線的樣式種類有[Bezier],[Flowchart],[StateMachine ],[Straight ]
    isTarget: true, // 是否可以放置（連線終點）
    maxConnections: 10, // 設置連接點最多可以連接幾條線
};

export default class JsplumbTest extends React.Component {
    jsPlumbInstance = null;
    state = {
        selectConn: null,
    }
    componentDidMount() {
        let self = this;
        this.jsPlumbInstance = jsPlumbIn.getInstance({
            PaintStyle: { lineWidth: 1, stroke: '#89bcde' },
            HoverPaintStyle: { stroke: "#FF6600", lineWidth: 3 },
            Endpoints: [
                ["Dot", { radius: 2 }],
                "Blank",
            ],
            MaxConnections: -1,
            EndpointStyle: { fill: "#89bcde" },
            EndpointHoverStyle: { fill: "#FF6600" },
            ConnectionOverlays: [
                ["Label", {
                    id: "label", cssClass: "aLabel", visible: true, events: {
                        "click": function (label, evt) {
                            // alert("clicked on label for connection " + label.component.id);
                        },
                    },
                }],
                // 這個是鼠標拉出來的線的屬性
            ],
        });
        self.jsPlumbInstance.ready(function () {
            self.jsPlumbInstance.bind('beforeDrop', function (conn) {
                //避免源節點和目標節點未同一個
                let sourceId = conn.sourceId,
                    targetId = conn.targetId;
                if (sourceId === targetId) {
                    return false;
                } else {
                    return true;
                }
            })
        })
        self.jsPlumbInstance.bind("connection", function (connInfo, originalEvent) {
            //連線時動作
            //例如給連線添加label文字
            let connection = connInfo.connection;
            let labelText = '未命名';
            connection.getOverlay("label").setLabel(labelText);
        })
        jsPlumbIn.bind("dblclick", function (conn, originalEvent) {
            //雙擊事件
            self.setState({ selectConn: conn})
            if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?")) {}
        })
        self.jsPlumbInstance.bind("contextmenu", function (component, e) {
            //連線鼠標右擊事件
        })
    }
    //因為我採用的時點擊添加按鈕，添加一個流程框  ，然後對流程框綁定四個錨點，所以以下方法針對我這個方案
    id = 0;
    add = () => {
        let self = this;
        let id = this.id++;
        $("#cavans").append(
            '<div id="' + id + '" >未命名流程框</div>');
        $("#" + id).css("left", 0).css("top", 0);
        $("#" + id).addClass(styles.node);//less
        this.addPoint(id);//添加錨點
        this.jsPlumbInstance.draggable(id, { containment: "right" });//可移動
    }
    //添加錨點
    addPoint = (id) => {
        const self = this;
        self.jsPlumbInstance.addEndpoint(id, { anchors: "Top", id: id + "Top" }, hollowCircle);
        self.jsPlumbInstance.addEndpoint(id, { anchors: "Bottom", id: id + "Bottom" }, hollowCircle);
        self.jsPlumbInstance.addEndpoint(id, { anchors: "Right", id: id + "Right" }, hollowCircle);
        self.jsPlumbInstance.addEndpoint(id, { anchors: "Left", id: id + "Left" }, hollowCircle);
    }
    //下面補充一些刪除方法，給已有流程框連線等方法
    //刪除流程框
    delete = () => {
        let ids = [1, 2, 3, 4, 5]//之前畫的流程框id集合
        for (let i of ids) {
            this.jsPlumbInstance.remove(i)
        }
    }
    //刪除連線
    deleteLine = () => {
        //selectConn 為連線點擊時獲取的conn
        this.jsPlumbInstance.deleteConnection(this.state.selectConn)
    }
    //為已有流程框連線 設置文字
    connectAndLabel = () => {
        //source target 為之前設置的流程框id
        this.jsPlumbInstance.connect({
            source: "test1",
            target: "test2",
            anchors: ["Right", "Left"],
            ...hollowCircle,
        });
        //setLabel
        this.jsPlumbInstance.getConnections({
            source: "test1",
            target: "test2",
        })[0].getOverlay('label').setLabel(12345);
    }
    render() {
        //div內容：一個添加按鈕 ，一個畫圖區
        return <div>
        </div>
    }
}

class AddButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = ({ clickCount: 0 })
        //在constructor指定呼叫addCount，並在呼叫時指定this為class本身
        this.addCount = this.addCount.bind(this)
    }

    addCount() {
        //第二個參數做為修改完後執行的function
        this.setState({ clickCount: this.state.clickCount + 1 },
            () => { console.log(`點了${this.state.clickCount}下`) })
    }

    render() {
        //在onClick中指定觸發的函式後面添加.bind(this)並填上傳入的第一個參數1
        return <input type="button"
            onClick={this.addCount.bind(this, 1)} value="點我" />
    }
}

//建立一個DOM物件
let element = <h1>Hello, world! Danny ...!</h1>

//使用ReactDOM.render把剛建立的物件element插入目標DOM中
//ReactDOM.render(
//  element,
//  document.getElementById('root')
//);

class HelloTitle extends React.Component {
    render() {
        return <p style={this.props.style}>{this.props.content}</p>
    }
}

//另外建立一個組件HelloTitle2
class HelloTitle2 extends React.Component {
    render() {
        //將props.title的值帶入標題
        return <h1>{this.props.title}！您好！</h1>
    }
}

class TitleDiv extends React.Component {
    render() {
        return (<div>
            <HelloTitle content="比較大的字" style={{ 'font-size': 18 }} />
            <HelloTitle content="比較小的字" style={{ 'font-size': 12 }} />
        </div>)
    }
}

class NowTime extends React.Component {
    constructor(props) {
        super(props)
        this.state = { time: new Date().toLocaleTimeString() }
    }

    //加入組件建構完成後執行的事件
    componentDidMount() {
        /*在建構完成後，每秒都去刷新this.state.time的值
        (1)先去宣告一個更新state內容的function
        (2)每秒去執行一次該function刷新*/
        const upTime = () => {
            //這裡面的setState()能夠重新設定state的值
            this.setState({ time: new Date().toLocaleTimeString() })
        }
        setInterval(upTime, 1000)
    }

    //加入state被修改時會執行的函式
    componentDidUpdate() {
        //執行內容
        console.log('時間一分一秒在跑...')
    }

    //組件結束時會執行的事件
    componentWillUnmount() {
        //這裡記錄移除掉的時間
        console.log(`移除組件的時間為：${this.state.time}`)
    }

    render() {
        return <h1>現在時間是{this.state.time}</h1>
    }
}

//宣告一個function，來移除document.getElementById('root')中的組件
const removeComponent = () => {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'))
}

//延遲五秒後執行移除
//setTimeout(removeComponent, 5000)

class InputGender extends React.Component {
    constructor(props) {
        super(props)
        this.state = ({ gender: '' })
        this.changeGender = this.changeGender.bind(this)
    }
    //strA是傳入的參數
    changeGender(strA) {
        console.log(`傳入參數${strA}`)
        console.log(window.event.target)
        this.setState({ gender: event.target.value })
    }
    componentDidUpdate() {
        console.log(`已將state.gender變動為：${this.state.gender}`)
    }
    render() {
        ////在render()中宣告一個title變數
        //let title;
        ////之後去判斷使用者選擇的是哪個
        //if(this.state.gender == "M")
        //    //如果是男生就將title設為先生，並將HelloTitle2組件給title變數
        //    title = <HelloTitle2 title="先生" />
        //else
        //    //女生則相反
        //    title = <HelloTitle2 title="小姐" />

        return (
            <div>
                {/*用花括號包住JavaScript語法，以下用一行式的if來處理*/}
                {(this.state.gender == "M") ?
                    <HelloTitle2 title="先生" /> : <HelloTitle2 title="小姐" />}
                <select onChange={this.changeGender.bind(this)}>
                    <option value="M">男</option>
                    <option value="W">女</option>
                </select>
            </div>)
    }
}



//直接使用該類別做出一個實體，不再另外設定傳入值
ReactDOM.render(<InputGender />, document.getElementById('input'))
ReactDOM.render(<Dotcon />, document.getElementById('diagram'))
ReactDOM.render(<JsplumbTest />, document.getElementById('diagram2'))
ReactDOM.render(<AddButton />, document.getElementById('button'))
ReactDOM.render(<NowTime />, document.getElementById('root'))
ReactDOM.render(<TitleDiv />, document.getElementById('root2'))

