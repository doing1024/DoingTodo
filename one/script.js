// 标题
var defaultTitle = "DoingTodo"; // 默认标题
var title = localStorage.getItem("title"); // 获取储存
var titler = document.getElementsByClassName("titler")[0]; // 标题容器h1
let edit = undefined;
if (title == null) {
  // 如果不存在
  localStorage.setItem("title", defaultTitle); // 设为默认标题
  title = defaultTitle;
}
titler.innerText = title;
titler.addEventListener("input", function () {
  //如果被修改，存储它！
  if (titler.innerText.indexOf("\n") != -1) {
    titler.innerText = titler.innerText.replace("\n", ""); // 禁止存在回车
  }
  localStorage.setItem("title", titler.innerText); // 存储
  // console.log("custom title!");
});
var Todo = function (string) {
  // Todo条目类
  // 将string解析并定义属性
  if (typeof string == "string") {
    var todoJson = JSON.parse(string); // 如果是字符串，进行解析
  } else var todoJson = string; // 否则，直接赋值
  // 定义属性
  var name = todoJson["name"], // 名称
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
  };
};
const quill = new Quill(".editor", {
  theme: "snow",
});
var createClose = function () {
  // 隐藏创建弹窗
  document.querySelector(".createBox").style.display = "none";
};
var createOpen = function () {
  // 显示创建弹窗
  document.querySelector(".createBox").style.display = "block";
  // 设置默认日期为今天
  document.querySelector(".createDate").valueAsDate = new Date();
  document.querySelector(".deadDate").valueAsDate = new Date();
};
var formatDateTime = function (date) {
  // 格式化日期
  var date = new Date(date); // 转换
  var y = date.getFullYear(); // 年
  var m = date.getMonth() + 1; // 月
  var d = date.getDate(); // 日
  // 补0
  m = m < 10 ? "0" + m : m; // 月
  d = d < 10 ? "0" + d : d; // 日
  return y + "-" + m + "-" + d; // 返回，穿插连字符
};
var sortTodos = function (a, b) {
  // 条目的排序标准（数字越小越靠前）
  /*sort的排序函数（备忘）：
     负数：a小于b
     0：a等于b
    正数：a大于b*/
  return a.marks - b.marks;
};
var showTodos = function () {
  // 如果存储中todos没有被创建过，创建一个空的
  if (localStorage.getItem("todos") == null) {
    localStorage.setItem("todos", "[]");
  }
  document.querySelector(".bodier").innerHTML = ``;
  // 读取、解析
  var todos = JSON.parse(localStorage.getItem("todos"));
  // 排序并重新储存
  todos.sort(sortTodos);
  for (var i = 0; i < todos.length; ++i) {
    if (todos[i].del) {
      // TODO 此处为软删除，为避免堆积数据，需要实现硬删除
      continue; // 如果已经被删除，跳过
    }
    // 该条目的DOM
    var todoDom = document.createElement("div");
    todoDom.id = i; // 设置id属性，方便删除
    todos[i].id = i;
    todoDom.className = "todo"; // 设置Class
    todoDom.innerHTML = ` 
<div >
  <p>${todos[i].name}</p>
  <p>创建时间：${formatDateTime(todos[i].createTime)}</p>
  <p>结束时间：${formatDateTime(todos[i].deadTime)}</p>
  <div class="icons"></div>
</div>
<div class="blank"></div>
<div class="info">${todos[i].info}</div>`; // 条目的html
    var editButton = document.createElement("div"); // 编辑按钮（容器）
    editButton.innerHTML = `<svg t="1731072964474" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4279" data-darkreader-inline-fill="" width="30" height="30"><path d="M870.4 909.409524H85.333333V124.342857H653.409524a36.571429 36.571429 0 1 0 0-73.142857H48.761905a36.571429 36.571429 0 0 0-36.571429 36.571429v858.209523c0 20.187429 16.384 36.571429 36.571429 36.571429h858.209524a36.571429 36.571429 0 0 0 36.571428-36.571429V341.333333a36.571429 36.571429 0 1 0-73.142857 0v568.076191z" fill="#FFA000" p-id="4280" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #c9830c;"></path><path d="M503.710476 585.191619l510.585905-510.537143A36.571429 36.571429 0 0 0 962.608762 22.918095L452.022857 533.455238a36.571429 36.571429 0 0 0 51.687619 51.736381z" fill="#FFA000" p-id="4281" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #c9830c;"></path></svg>`;
    var delButton = document.createElement("div"); // 删除按钮（容器）
    delButton.innerHTML = `<svg t="1731071304285" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4285" data-darkreader-inline-fill="" width="30" height="30" ><path d="M630.09 151.91V62.16H361.84v89.74H93.6v134.62h89.41v673.11h625.93v-673.1h89.42V151.91H630.09zM361.84 869.89h-89.43V286.53h89.43v583.36z m178.84 0h-89.43V286.53h89.43v583.36z m178.84 0h-89.43V286.53h89.43v583.36z" fill="#FA596F" p-id="4286" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #970b1c;"></path></svg>`;
    // 将按钮加入条目
    todoDom.querySelector(".icons").appendChild(delButton);
    todoDom.querySelector(".icons").appendChild(editButton);
    delButton.addEventListener("click", function () {
      var fa = this.parentNode.parentNode.parentNode;
      var todos = JSON.parse(localStorage.getItem("todos"));
      todos[fa.id].del = true;
      localStorage.setItem("todos", JSON.stringify(todos));
      fa.remove();
    }); // 删除按钮点击事件
    editButton.addEventListener("click", function () {
      var todos = JSON.parse(localStorage.getItem("todos"));
      var fa = this.parentNode.parentNode.parentNode;
      document.querySelector(".nameText").value = todos[fa.id].name;
      document.querySelector(".marksNumber").value = todos[fa.id].marks;
      document.querySelector(".createDate").valueAsDate = new Date(
        todos[fa.id].createTime,
      );
      document.querySelector(".deadDate").valueAsDate = new Date(
        todos[fa.id].deadTime,
      );
      createOpen();
      edit = fa.id;
    }); // 编辑按钮点击事件;
    document.querySelector(".bodier").appendChild(todoDom); // 将该条目加入bodier
  }
  localStorage.setItem("todos", JSON.stringify(todos));
};
var addTodo = function (todo) {
  if (localStorage.getItem("todos") == null) {
    localStorage.setItem("todos", "[]");
  }
  var todos = JSON.parse(localStorage.getItem("todos"));
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
  showTodos();
};
var clickAdd = function () {
  // 如果是编辑，那么将原来的删掉
  if (edit != undefined) {
    var todos = JSON.parse(localStorage.getItem("todos"));
    todos[edit].del = true;
    localStorage.setItem("todos", JSON.stringify(todos));
    edit = undefined;
  }
  // 新的todo对象
  var todo = Todo({
    name: document.querySelector(".nameText").value,
    info: quill.root.innerHTML,
    marks: document.querySelector(".marksNumber").value,
    createTime: document.querySelector(".createDate").valueAsDate,
    deadTime: document.querySelector(".deadDate").valueAsDate,
  });
  addTodo(todo);
  createClose();
};
var resetTodos = function () {
  localStorage.setItem("todos", "[]");
  location.reload();
};
var resetAll = function () {
  // 重置所有数据
  localStorage.setItem("title", defaultTitle);
  resetTodos();
};
// 绑定事件
document.querySelector(".add").addEventListener("click", createOpen); // 添加
document.querySelector(".reset").addEventListener("click", resetAll); // 重置
document.querySelector(".delete").addEventListener("click", resetTodos); // 重置
document.querySelector(".createOk").addEventListener("click", clickAdd); // ok
document.querySelector(".createCancel").addEventListener("click", createClose); // cancel
showTodos();

// 定期检查是否到期
var checkBeginDate = function () {
  if (localStorage.getItem("todos") == null) {
    localStorage.setItem("todos", "[]");
  }
  // 读取、解析
  var todos = JSON.parse(localStorage.getItem("todos"));
  for (var i = 0; i < todos.length; ++i) {
    if (todos[i].del) continue;
    var date = new Date(todos[i].createTime);
    if (new Date() > date) alert(`任务${todos[i].name}要开始啦！`);
  }
};
// 定期检查是否到期
var checkEndDate = function () {
  if (localStorage.getItem("todos") == null) {
    localStorage.setItem("todos", "[]");
  }
  // 读取、解析
  var todos = JSON.parse(localStorage.getItem("todos"));
  for (var i = 0; i < todos.length; ++i) {
    if (todos[i].del) continue;
    var date = new Date(todos[i].deadTime);
    if (new Date() > date) alert(`任务${todos[i].name}要到期啦！`);
  }
};
checkBeginDate();
checkEndDate();
var timer = window.setInterval(function () {
  checkBeginDate();
  checkEndDate();
}, 1000 * 60);
