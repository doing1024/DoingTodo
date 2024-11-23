// ----------------------------------------------------主功能----------------------------------
function get(key) {
  // 获取数据
  let resultData;
  const pushDataOut = function (data) {
    resultData = data;
  };
  $.ajax({
    url: "https://todoapi.doing1024.us.kg/get/" + key,
    dataType: "text",
    success: function (result) {
      pushDataOut(result);
    },
  });
  return resultData || null;
}

function update(key, value) {
  // 写入数据
  let url = `https://todoapi.doing1024.us.kg/set/${key}/${encodeURIComponent(JSON.stringify(value))}`;
  $.ajax({
    url: url,
    dataType: "text",
  });
}
// 初始变量
let defaultTitle = "DoingTodo",
  title,
  userName;
let edit = undefined;
const titler = $(".titler"); // 标题容器h1
titler.on("input", function () {
  //如果被修改，存储它！
  if (titler.text().indexOf("\n") !== -1) {
    titler.text(titler.text().replace("\n", "")); // 禁止存在回车
  }
  update("title" + userName, titler.text()); // 存储
  // console.log("custom title!");
});
const Todo = function (string) {
  // Todo条目类
  // 将string解析并定义属性
  let todoJson;
  if ("string" == typeof string) {
    todoJson = JSON.parse(string); // 如果是字符串，进行解析
  } else {
    todoJson = string; // 否则，直接赋值
  }
  // 定义属性
  let name = todoJson["name"], // 名称
    info = todoJson["info"], // 灵感
    marks = Number(todoJson["marks"]), // 优先级
    createTime = new Date(todoJson["createTime"]), // 创建日期
    deadTime = new Date(todoJson["deadTime"]); // 截止日期
  // 返回object
  return {
    name: name,
    info: info,
    marks: marks,
    createTime: createTime,
    deadTime: deadTime,
    del: false,
    id: -1,
    begin: false,
    end: false,
  };
};
const quill = new Quill(".editor", {
  theme: "snow",
});
const createClose = function () {
  // 隐藏创建弹窗
  $(".createBox").hide();
};
const createOpen = function () {
  // 显示创建弹窗
  $(".createBox").show();
  // 设置默认日期为今天
  $(".createDate").get(0).valueAsDate = new Date();
  $(".deadDate").get(0).valueAsDate = new Date();
};
const formatDateTime = function (dt) {
  // 格式化日期
  const date = new Date(dt); // 转换
  const y = date.getFullYear(); // 年
  let m = date.getMonth() + 1; // 月
  let d = date.getDate(); // 日
  // 补0
  m = 10 > m ? "0" + m : m; // 月
  d = 10 > d ? "0" + d : d; // 日
  return y + "-" + m + "-" + d; // 返回，穿插连字符
};
const sortTodos = function (a, b) {
  // 条目的排序标准（数字越小越靠前）
  /*sort的排序函数（备忘）：
       负数：a小于b
       0：a等于b
      正数：a大于b*/
  return a.marks - b.marks;
};
const showTodos = function () {
  // 如果存储中todos没有被创建过，创建一个空的
  if (null == get("todos" + userName)) {
    update("todos" + userName, "[]");
  }
  $(".bodier").html(``);
  // 读取、解析
  let todos = JSON.parse(get("todos" + userName));
  // 排序并重新储存
  todos.sort(sortTodos);
  for (let i = 0; i < todos.length; ++i) {
    if (todos[i].del) {
      // TODO 此处为软删除，为避免堆积数据，需要实现硬删除
      continue; // 如果已经被删除，跳过
    }
    // 该条目的DOM
    let todoDom = document.createElement("div");
    todoDom.id = i; // 设置id属性，方便删除
    todos[i].id = i;
    todoDom.className = "todo"; // 设置Class+
    todoDom.innerHTML = ` 
<div>
  <p>${todos[i].name}</p>
  <p>创建时间：${formatDateTime(todos[i].createTime)}</p>
  <p>结束时间：${formatDateTime(todos[i].deadTime)}</p>
  <div class="icons"></div>
</div>
<div class="blank"></div>
<div class="info">${todos[i].info}</div>`; // 条目的html
    let editButton = document.createElement("div"); // 编辑按钮（容器）
    editButton.innerHTML = `<svg t="1731072964474" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4279" data-darkreader-inline-fill="" width="30" height="30"><path d="M870.4 909.409524H85.333333V124.342857H653.409524a36.571429 36.571429 0 1 0 0-73.142857H48.761905a36.571429 36.571429 0 0 0-36.571429 36.571429v858.209523c0 20.187429 16.384 36.571429 36.571429 36.571429h858.209524a36.571429 36.571429 0 0 0 36.571428-36.571429V341.333333a36.571429 36.571429 0 1 0-73.142857 0v568.076191z" fill="#FFA000" p-id="4280" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #c9830c;"></path><path d="M503.710476 585.191619l510.585905-510.537143A36.571429 36.571429 0 0 0 962.608762 22.918095L452.022857 533.455238a36.571429 36.571429 0 0 0 51.687619 51.736381z" fill="#FFA000" p-id="4281" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #c9830c;"></path></svg>`;
    let delButton = document.createElement("div"); // 删除按钮（容器）
    delButton.innerHTML = `<svg t="1731071304285" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4285" data-darkreader-inline-fill="" width="30" height="30" ><path d="M630.09 151.91V62.16H361.84v89.74H93.6v134.62h89.41v673.11h625.93v-673.1h89.42V151.91H630.09zM361.84 869.89h-89.43V286.53h89.43v583.36z m178.84 0h-89.43V286.53h89.43v583.36z m178.84 0h-89.43V286.53h89.43v583.36z" fill="#FA596F" p-id="4286" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #970b1c;"></path></svg>`;
    // 将按钮加入条目
    todoDom.querySelector(".icons").appendChild(delButton);
    todoDom.querySelector(".icons").appendChild(editButton);
    $(delButton).on("click", function () {
      let fa = this.parentNode.parentNode.parentNode;
      let todos = JSON.parse(get("todos" + userName));
      todos[fa.id].del = true;
      update("todos" + userName, JSON.stringify(todos));
      fa.remove();
    }); // 删除按钮点击事件
    $(editButton).on("click", function () {
      const todos = JSON.parse(get("todos" + userName));
      let fa = this.parentNode.parentNode.parentNode;
      $(".nameText").val(todos[fa.id].name);
      $(".marksNumber").val(todos[fa.id].marks);
      $(".createDate").get(0).valueAsDate = new Date(todos[fa.id].createTime);
      $(".deadDate").get(0).valueAsDate = new Date(todos[fa.id].deadTime);
      createOpen();
      edit = fa.id;
    }); // 编辑按钮点击事件;
    document.querySelector(".bodier").appendChild(todoDom); // 将该条目加入bodier
  }
  update("todos" + userName, JSON.stringify(todos));
};
const addTodo = function (todo) {
  if (null == get("todos" + userName)) {
    update("todos" + userName, "[]");
  }
  let todos = JSON.parse(get("todos" + userName));
  todos.push(todo);
  update("todos" + userName, JSON.stringify(todos));
  showTodos();
};
const clickAdd = function () {
  // 如果是编辑，那么将原来的删掉
  if (edit != undefined) {
    let todos = JSON.parse(get("todos" + userName));
    todos[edit].del = true;
    update("todos" + userName, JSON.stringify(todos));
    edit = undefined;
  }
  // 新的todo对象
  let todo = Todo({
    name: $(".nameText").val(),
    info: $(quill.root).html(),
    marks: $(".marksNumber").val(),
    createTime: $(".createDate").get(0).valueAsDate,
    deadTime: $(".deadDate").get(0).valueAsDate,
  });
  addTodo(todo);
  createClose();
};
const resetTodos = function () {
  update("todos" + userName, "[]");
  location.reload();
};
const resetAll = function () {
  // 重置所有数据
  update("title" + userName, defaultTitle);
  resetTodos();
};
// 绑定事件
$(".add").on("click", createOpen); // 添加
$(".reset").on("click", resetAll); // 重置
$(".delete").on("click", resetTodos); // 重置
$(".createOk").on("click", clickAdd); // ok
$(".createCancel").on("click", createClose); // cancel
showTodos();

// 定期检查是否到期
var checkBeginDate = function () {
  if (null == get("todos" + userName)) {
    update("todos" + userName, "[]");
  }
  // 读取、解析
  var todos = JSON.parse(get("todos" + userName));
  for (var i = 0; i < todos.length; ++i) {
    if (todos[i].del || todos[i].begin) continue;
    var date = new Date(todos[i].createTime);
    if (new Date() > date) {
      alert(`任务“${todos[i].name}”在今天开始！`), (todos[i].begin = true);
    }
  }
  update("todos" + userName, JSON.stringify(todos));
};
const checkEndDate = function () {
  if (null == get("todos" + userName)) {
    update("todos" + userName, "[]");
  }
  // 读取、解析
  var todos = JSON.parse(get("todos" + userName));
  for (let i = 0; i < todos.length; ++i) {
    if (todos[i].del || todos[i].end) continue;
    const date = new Date(todos[i].deadTime);
    if (new Date() > date) {
      alert(`任务“${todos[i].name}”今天结束！`), (todos[i].end = true);
    }
  }
  update("todos" + userName, JSON.stringify(todos));
};
const timer = window.setInterval(function () {
  checkBeginDate();
  checkEndDate();
}, 1000 * 60);
const getQueryVariable = function (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
};
$(function () {
  checkBeginDate();
  checkEndDate();
  userName = getQueryVariable("user");
  title = get("title" + userName);
  // 获取储存
  if (null == title) {
    // 如果不存在标题
    update("title" + userName, defaultTitle); // 设为默认标题
    title = defaultTitle;
  }

  titler.text(title);
});

// ----------------------------------------插件系统---------------------------------------------------
var Config = function () {};
