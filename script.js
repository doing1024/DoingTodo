$(document).ready(function () {
  function showLoading(text = "加载中...") {
    if (!document.getElementById("loadingDiv")) {
      const div = document.createElement("div");
      div.id = "loadingDiv";
      div.innerHTML = `
      <style>
        #loadingDiv {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        #loadingDiv::after {
          content: '${text}';
          color: white;
          margin-left: 10px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #loadingDiv::before {
          content: '';
          width: 20px;
          height: 20px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      </style>
    `;
      document.body.appendChild(div);
    }
  }

  function hideLoading() {
    const div = document.getElementById("loadingDiv");
    if (div) div.remove();
  }
  let editingItemId = null;
  let quill, editQuill;
  let currentUser;

  // Get current user from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
    currentUser = urlParams.get("version")=="host"?urlParams.get("user"):"one";

  if (!currentUser) {
    window.location.href = `https://todo.doing1024.us.kg/`;
    return;
  }

  // Initialize Quill editors
  quill = new Quill("#editor-container", {
    theme: "snow",
  });
  editQuill = new Quill("#edit-editor-container", {
    theme: "snow",
  });

  // API functions
  // if is on host-version,use API,use localstorage else.
  async function setDataAPI(key, value) {
    const response = await fetch(
      `https://todoapi.doing1024.us.kg/set/${currentUser}_${key}/${encodeURIComponent(JSON.stringify(value))}`,
    );
    return response.text();
  }

  async function getDataAPI(key) {
    const response = await fetch(
      `https://todoapi.doing1024.us.kg/get/${currentUser}_${key}`,
    );
    var data = await response.text();
    data = JSON.parse(data)["data"];
    return data ? JSON.parse(data) : null;
  }
  async function getDataLocal(key) {
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
    async function setDataLocal(key,value) {
	localStorage.setItem(key,JSON.stringify(value));
  }
  const getData = urlParams.get("version") == "host" ? getDataAPI : getDataLocal;
  const setData = urlParams.get("version") == "host" ? setDataAPI : setDataLocal;
  // Load title from API
  getData("todoTitle").then((savedTitle) => {
    if (savedTitle) {
      $("#title").text(savedTitle);
    }
  });

  // Save title to API when changed
  $("#title").on("input", function () {
    setData("todoTitle", $(this).text());
  });

  // Show add modal when add button is clicked
  $("#addBtn").click(function () {
    $("#addModal").show();
    // Set default dates to today
    const today = new Date().toISOString().split("T")[0];
    $("#newItemStartDate").val(today);
    $("#newItemEndDate").val(today);
  });

  // Close add modal when close button is clicked
  $("#closeAddModal").click(function () {
    $("#addModal").hide();
  });

  // Show edit modal when edit button is clicked
  $(document).on("click", ".editBtn", function () {
    const itemId = $(this).closest(".todo-item").attr("id");
    editingItemId = itemId;
    const item = $(`#${itemId}`);
    $("#editItemTitle").val(item.find(".title").val());
    $("#editItemPriority").val(item.find(".priority").val());
    $("#editItemStartDate").val(item.find(".start-date").val());
    $("#editItemEndDate").val(item.find(".end-date").val());
    editQuill.root.innerHTML = item.find(".description").html();
    $("#editModal").show();
  });

  // Close edit modal when close button is clicked
  $("#closeEditModal").click(function () {
    $("#editModal").hide();
    editingItemId = null;
  });

  // Save new item when save button in add modal is clicked
  $("#saveNewItem").click(function () {
    const newItem = {
      id: Date.now(),
      title: $("#newItemTitle").val(),
      priority: parseInt($("#newItemPriority").val()) || 0,
      startDate: $("#newItemStartDate").val(),
      endDate: $("#newItemEndDate").val(),
      description: quill.root.innerHTML,
    };
    addTodoItem(newItem);
    saveTodos();
    $("#addModal").hide();
    // Clear modal inputs
    $("#addModal input").val("");
    quill.setText("");
  });

  // Save edited item when save button in edit modal is clicked
  $("#saveEditItem").click(function () {
    const editedItem = {
      id: editingItemId,
      title: $("#editItemTitle").val(),
      priority: parseInt($("#editItemPriority").val()) || 0,
      startDate: $("#editItemStartDate").val(),
      endDate: $("#editItemEndDate").val(),
      description: editQuill.root.innerHTML,
    };
    updateTodoItem(editedItem);
    $("#editModal").hide();
    editingItemId = null;
  });

  // Add new todo item
  function addTodoItem(item) {
    const todoItem = `
                    <div class="todo-item" id="${item.id}" data-priority="${item.priority}">
                        <input type="number" class="priority" value="${item.priority}" placeholder="优先级">
                        <div class="content">
                            <input type="text" class="title" value="${item.title}" placeholder="条目名称">
                            <div class="dates">
                                开始日期：<input type="date" class="start-date" value="${item.startDate}"><br>
                                结束日期：<input type="date" class="end-date" value="${item.endDate}">
                            </div>
                        </div>
                        <div class="description">${item.description}</div>
                        <div class="actions">
                            <button class="editBtn"><svg t="1732596510458" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1486" data-darkreader-inline-fill="" width="30" height="30"><path d="M960.512 197.952l-134.4-134.4 63.36-63.36 134.4 134.4z m-505.024 503.168L322.88 568.512l437.632-437.632 132.608 132.608zM192 697.6l63.36-63.424 134.4 134.4-63.36 63.36-130.624-3.84zM128 896h704V512h128v512H0V0h512v128H128v768z" fill="#4C89FB" p-id="1487" style="--darkreader-inline-fill: #10409a;" data-darkreader-inline-fill=""></path></svg></button>
                            <button class="deleteBtn"><svg t="1732596519087" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4189" data-darkreader-inline-fill="" width="30" height="30"><path d="M519.620465 0c-103.924093 0-188.511256 82.467721-192.083349 185.820279H85.015814A48.91386 48.91386 0 0 0 36.101953 234.686512a48.91386 48.91386 0 0 0 48.913861 48.866232h54.010046V831.345116c0 102.852465 69.822512 186.844279 155.909954 186.844279h439.200744c86.087442 0 155.909953-83.491721 155.909954-186.844279V284.100465h48.91386a48.91386 48.91386 0 0 0 48.913861-48.890046 48.91386 48.91386 0 0 0-48.913861-48.866233h-227.756651A191.559442 191.559442 0 0 0 519.620465 0z m-107.234232 177.080558c3.548279-49.771163 46.627721-88.540279 99.851907-88.540279 53.224186 0 96.327442 38.745302 99.351813 88.540279h-199.20372z m-111.997024 752.044651c-30.981953 0-65.083535-39.15014-65.083535-95.041488V287.744h575.488v546.839814c0 55.915163-34.077767 95.041488-65.059721 95.041488H300.389209v-0.500093z" fill="#D81E06" p-id="4190" style="--darkreader-inline-fill: #a82211;" data-darkreader-inline-fill=""></path><path d="M368.116093 796.814884c24.361674 0 44.27014-21.670698 44.27014-48.818605v-278.623256c0-27.147907-19.908465-48.818605-44.27014-48.818604-24.33786 0-44.27014 21.670698-44.27014 48.818604v278.623256c0 27.147907 19.360744 48.818605 44.293954 48.818605z m154.933581 0c24.361674 0 44.293953-21.670698 44.293954-48.818605v-278.623256c0-27.147907-19.932279-48.818605-44.293954-48.818604-24.33786 0-44.27014 21.670698-44.270139 48.818604v278.623256c0 27.147907 19.932279 48.818605 44.293953 48.818605z m132.810419 0c24.33786 0 44.27014-21.670698 44.27014-48.818605v-278.623256c0-27.147907-19.932279-48.818605-44.27014-48.818604s-44.27014 21.670698-44.27014 48.818604v278.623256c0 27.147907 19.360744 48.818605 44.27014 48.818605z" fill="#D81E06" p-id="4191" style="--darkreader-inline-fill: #a82211;" data-darkreader-inline-fill=""></path></svg></button>
                        </div>
                    </div>
                `;
    $("#todoList").append(todoItem);
    sortTodoItems();
  }

  // Update existing todo item
  function updateTodoItem(item) {
    const todoItem = $(`#${item.id}`);
    todoItem.find(".priority").val(item.priority);
    todoItem.find(".title").val(item.title);
    todoItem.find(".start-date").val(item.startDate);
    todoItem.find(".end-date").val(item.endDate);
    todoItem.find(".description").html(item.description);
    todoItem.attr("data-priority", item.priority);
    sortTodoItems();
    saveTodos();
  }

  // Delete todo item
  $(document).on("click", ".deleteBtn", function () {
    $(this).closest(".todo-item").remove();
    saveTodos();
  });

  // Sort todo items by priority
  function sortTodoItems() {
    const todoItems = $(".todo-item").get();
    todoItems.sort(function (a, b) {
      const priorityA = parseInt($(a).data("priority"));
      const priorityB = parseInt($(b).data("priority"));
      return priorityB - priorityA;
    });
    $("#todoList").empty().append(todoItems);
  }

  // Clear all items
  $("#clearBtn").click(function () {
    $("#todoList").empty();
    saveTodos();
  });

  // Save to API whenever there's a change
  $(document).on("change", ".todo-item input", function () {
    saveTodos();
  });

  // Re-sort items when priority is changed
  $(document).on("change", ".todo-item .priority", function () {
    const item = $(this).closest(".todo-item");
    item.attr("data-priority", $(this).val());
    sortTodoItems();
    saveTodos();
  });

  // Save todos to API
  function saveTodos() {
    const todos = [];
    $(".todo-item").each(function () {
      todos.push({
        id: $(this).attr("id"),
        priority: $(this).find(".priority").val(),
        title: $(this).find(".title").val(),
        startDate: $(this).find(".start-date").val(),
        endDate: $(this).find(".end-date").val(),
        description: $(this).find(".description").html(),
      });
    });
    setData("todos", todos);
  }
  showLoading("条目加载中，请稍候");
  // Load from API on page load
  getData("todos").then((savedTodos) => {
    if (savedTodos) {
      savedTodos.forEach(addTodoItem);
      saveTodos();
    }
    hideLoading();
  });
});
