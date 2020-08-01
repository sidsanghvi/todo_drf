//wait for all html to load
document.addEventListener("DOMContentLoaded", () => {
  // create csrf token. Codeblock taken from django docs.
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  var csrftoken = getCookie("csrftoken");

  // logic to get task data and render on client
  function buildList() {
    //initialise needed variables
    var wrapper = document.getElementById("list-wrapper");
    var url = "/api/task-list/";

    // empty out wrapper before rendering list
    wrapper.innerHTML = "";

    // initiate fetch to get data from above api url
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        // loop through data once recieved and converted to json
        for (var i in data) {
          // each iteration creates new html item to render with attributes...
          // custom to the slected data point

          // logic to render a strike through completed tasks
          var tit = `<span class='title'>${data[i].title}</span>`;

          if (data[i].completed == true) {
            tit = `<strike class='title'>${data[i].title}</strike>`;
          }

          var item = `
            <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                <div style="flex:7">
                    ${tit}
                </div>
                <div style="flex:1">
                    <button class="btn btn-sm btn-outline-info edit">Edit</button>
                </div>
                <div style="flex:1">
                    <button class="btn btn-sm btn-outline-dark delete">-</button>
                </div>
            </div>
            `;
          // append new item to html div without reloading all html
          wrapper.insertAdjacentHTML("beforeend", item);

          // set each edit&del button to variable
          var editBtn = document.getElementsByClassName("edit")[i];
          var deleteBtn = document.getElementsByClassName("delete")[i];
          var title = document.getElementsByClassName("title")[i];

          // on edit button click, call editItem function on selected item
          // unclear of this code block logic
          editBtn.addEventListener(
            "click",
            ((item) => {
              return () => {
                editItem(item);
              };
            })(data[i])
          );

          // on delete button click, call deleteItem function on selected item
          // unclear of this code block logic
          deleteBtn.addEventListener(
            "click",
            ((item) => {
              return () => {
                deleteItem(item);
              };
            })(data[i])
          );

          // on title click, call strikeUnstrike function on selected item
          // unclear of this code block logic
          title.addEventListener(
            "click",
            ((item) => {
              return () => {
                strikeUnstrike(item);
              };
            })(data[i])
          );
        }
        console.log(data);
      });
  }

  activeItem = null;
  buildList();

  // edit item logic
  function editItem(item) {
    // set item to be editted to a variable
    activeItem = item;
    // populate title of selected item in form input area
    document.getElementById("title").value = activeItem.title;
  }

  //delete item logic
  function deleteItem(item) {
    var url = `/api/task-delete/${item.id}/`;
    // send delete request to above url with
    fetch(url, {
      method: "Delete",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    }).then(() => {
      // re-render task list
      buildList();
    });
  }

  function strikeUnstrike(item) {
    var url = `/api/task-update/${item.id}/`;

    // invert item.completed boolean value
    item.completed = !item.completed;

    // send delete request to above url with
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      // name to be sent under: actual data
      body: JSON.stringify({ title: item.title, completed: item.completed }),
    }).then(() => {
      // re-render task list
      buildList();
    });
  }

  // logic to add item to to-do lists
  var form = document.getElementById("form-wrapper");

  //On submit logic
  form.addEventListener("submit", (e) => {
    // prevent form from submitting
    e.preventDefault();

    var url = "/api/task-create/";

    // change url if existing item is being edited
    if (activeItem != null) {
      var url = `/api/task-update/${activeItem.id}/`;
      activeItem = null;
    }

    var title = document.getElementById("title").value;

    // send post request to above url with
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      // name to be sent under: actual data
      body: JSON.stringify({ title: title }),
    }).then(() => {
      // re-render task list
      buildList();
      // clear form field
      document.getElementById("form").reset();
    });
  });
});
