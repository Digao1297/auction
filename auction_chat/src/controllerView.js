const { remote } = require("electron");
const vex = require("vex-js");
const $ = require("jquery");

var conversations = document.getElementById("conversations");

//vex init
vex.registerPlugin(require("vex-dialog"));
vex.defaultOptions.className = "vex-theme-os";

document.getElementById("close").addEventListener("click", () => {
  remote.getCurrentWindow().close();
  console.log("fechou");
});

document.getElementById("minimize").addEventListener("click", () => {
  remote.getCurrentWindow().minimize();
  console.log("minimizou");
});

function KeyPress() {
  let message = document.getElementById("input-text");

  if (
    event.keyCode == 13 &&
    message.value.replace(/(\r\n|\n|\r)/gm, "") != ""
  ) {
    event.preventDefault();
    sendMessage(message.value);

    // console.log(message.value);
    message.value = "";
    conversations.scrollTop = conversations.scrollHeight;
  }
}

function SendViewMessage(user, msg) {
  let div =
    '<div class="message"><h6>' +
    (user == undefined ? "" : user) +
    '</h6><p class="msg">' +
    msg +
    "</p></div>";
  let tempHtml = conversations.innerHTML;

  conversations.innerHTML = tempHtml + div;
}

function Recivied({ user, msg }) {
  SendViewMessage(user, msg);
}

function Modal() {
  vex.dialog.open({
    message: "",
    input: ['<input type="text" placeholder="Nome" name="name">'].join(""),
    buttons: [
      $.extend({}, vex.dialog.buttons.YES, { text: "Salvar" }),
      $.extend({}, vex.dialog.buttons.NO, { text: "Fechar" }),
    ],
    callback: (data) => {
      if (!data) {
        remote.getCurrentWindow().close();
      } else {
        your = data.name;
        startChat();
        $("#your").text(data.name);
      }
    },
  });
}

Modal();
