// 标题
var defaultTitle = "DoingTodo"; // 默认标题
var title = localStorage.getItem("title"); // 获取储存
var titler = document.getElementsByClassName("titler")[0]; // 标题容器h1
if (title == null) {
  // 如果不存在
  localStorage.setItem("title", defaultTitle); // 设为默认标题
  title = defaultTitle;
}
titler.innerText = title;
titler.addEventListener("input", function () {
  //如果被修改，存储它！
  if (titler.innerText.indexOf("\n") != -1)
    titler.innerText = titler.innerText.replace("\n", ""); // 禁止存在回车
  localStorage.setItem("title", titler.innerText); // 存储
  // console.log("custom title!");
});
var Todo = function (string) {
  // Todo条目类
  // 将string解析并定义变量
  if (typeof string == "string") var todoJson = JSON.parse(string);
  else var todoJson = string;
  var name = todoJson["name"],
    info = todoJson["info"],
    marks = Number(todoJson["marks"]),
    createTime = new Date(todoJson["createTime"]),
    deadTime = new Date(todoJson["deadTime"]);
  // 字符串生成函数
  var makeString = function () {
    return JSON.stringify({
      name: name,
      info: info,
      marks: marks,
      createTime: createTime,
      deadTime: deadTime,
    });
  };
  // 返回object
  return {
    name: name,
    info: info,
    marks: marks,
    createTime: createTime,
    deadTime: deadTime,
    makeString: makeString,
    del: false,
    id: -1,
  };
};
var createClose = function () {
  // 隐藏创建弹窗
  document.querySelector(".createBox").style.display = "none";
};
var createOpen = function () {
  // 显示创建弹窗
  document.querySelector(".createBox").style.display = "flex";
  // 设置默认日期为today
  document.querySelector(".createDate").valueAsDate = new Date();
  document.querySelector(".deadDate").valueAsDate = new Date();
};
var formatDateTime = function (date) {
  console.log(date);
  var date = new Date(date);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  var d = date.getDate();
  d = d < 10 ? "0" + d : d;
  return y + "-" + m + "-" + d;
};
var sortTodos = function (a, b) {
  return a.marks - b.marks;
};
var showTodos = function () {
  var todosDom = ``;
  if (localStorage.getItem("todos") == null)
    localStorage.setItem("todos", "[]");
  var todos = JSON.parse(localStorage.getItem("todos"));
  todos.sort(sortTodos);
  localStorage.setItem("todos", JSON.stringify(todos));
  document.querySelector(".bodier").innerHTML = ``;
  for (var i = 0; i < todos.length; ++i) {
    if (todos[i].del) {
      continue;
    }
    var todoDom = document.createElement("div");
    todoDom.id = i;
    todoDom.className = "todo";
    todoDom.innerHTML = `<div><p>${todos[i].name}</p><p>创建时间：${formatDateTime(todos[i].createTime)}</p><p>结束时间：${formatDateTime(todos[i].deadTime)}</p><div class="icons"></div></div><div>${todos[i].info}</div>`;
    var editButton = document.createElement("div");
    editButton.innerHTML = `<svg t="1731072964474" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4279" data-darkreader-inline-fill="" width="30" height="30"><path d="M870.4 909.409524H85.333333V124.342857H653.409524a36.571429 36.571429 0 1 0 0-73.142857H48.761905a36.571429 36.571429 0 0 0-36.571429 36.571429v858.209523c0 20.187429 16.384 36.571429 36.571429 36.571429h858.209524a36.571429 36.571429 0 0 0 36.571428-36.571429V341.333333a36.571429 36.571429 0 1 0-73.142857 0v568.076191z" fill="#FFA000" p-id="4280" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #c9830c;"></path><path d="M503.710476 585.191619l510.585905-510.537143A36.571429 36.571429 0 0 0 962.608762 22.918095L452.022857 533.455238a36.571429 36.571429 0 0 0 51.687619 51.736381z" fill="#FFA000" p-id="4281" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #c9830c;"></path></svg>`;
    var delButton = document.createElement("div");
    delButton.innerHTML = `<svg t="1731071304285" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4285" data-darkreader-inline-fill="" width="30" height="30" ><path d="M630.09 151.91V62.16H361.84v89.74H93.6v134.62h89.41v673.11h625.93v-673.1h89.42V151.91H630.09zM361.84 869.89h-89.43V286.53h89.43v583.36z m178.84 0h-89.43V286.53h89.43v583.36z m178.84 0h-89.43V286.53h89.43v583.36z" fill="#FA596F" p-id="4286" data-darkreader-inline-fill="" style="--darkreader-inline-fill: #970b1c;"></path></svg>`;
    todoDom.querySelector("div div").appendChild(delButton);
    todoDom.querySelector("div div").appendChild(editButton);
    delButton.addEventListener("click", function () {
      var fa = this.parentNode;
      var todos = JSON.parse(localStorage.getItem("todos"));
      todos[fa.id].del = true;
      localStorage.setItem("todos", JSON.stringify(todos));
      fa.remove();
    });
    editButton.addEventListener("click", function () {
      createOpen();
      var todos = JSON.parse(localStorage.getItem("todos"));
      var fa = this.parentNode;
      document.querySelector(".nameText").value = todos[fa.id].name;
      document.querySelector(".marksNumber").value = todos[fa.id].marks;
      document.querySelector(".createDate").valueAsDate = new Date(
        todos[fa.id].createTime,
      );
      document.querySelector(".deadDate").valueAsDate = new Date(
        todos[fa.id].deadTime,
      );
      var todos = JSON.parse(localStorage.getItem("todos"));
      todos[fa.id].del = true;
      localStorage.setItem("todos", JSON.stringify(todos));
      fa.remove();
    });
    document.querySelector(".bodier").appendChild(todoDom);
  }
};
var addTodo = function (todo) {
  if (localStorage.getItem("todos") == null)
    localStorage.setItem("todos", "[]");
  var todos = JSON.parse(localStorage.getItem("todos"));
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
  showTodos();
};
var clickAdd = function () {
  var todo = Todo({
    name: document.querySelector(".nameText").value,
    info: document.querySelector(".info").value,
    marks: document.querySelector(".marksNumber").value,
    createTime: document.querySelector(".createDate").valueAsDate,
    deadTime: document.querySelector(".deadDate").valueAsDate,
  });
  addTodo(todo);
  createClose();
};
document.querySelector(".add").addEventListener("click", createOpen);
document.querySelector(".createOk").addEventListener("click", clickAdd);
document.querySelector(".createCancel").addEventListener("click", createClose);
showTodos();
