import React from 'react';
import { Modal } from 'antd';
import jsplumb from jsplumb
const { confirm } = Modal;
const jsPlumbIn = jsplumb.jsPlumb;
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
            }
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
            self.setState({ selectConn: conn)
            if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
        });
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
        this.jsPlumbInstance.draggable(id, { containment: "right" });.//可移動
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