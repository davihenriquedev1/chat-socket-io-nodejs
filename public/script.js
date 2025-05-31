const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const nicknameInput = document.getElementById("nickname");
const messages = document.getElementById("messages");
const usersList = document.getElementById("users-list");

nicknameInput.addEventListener("change", () => {
    const nickname = nicknameInput.value.trim();
    if (nickname) {
        socket.emit("set nickname", nickname);
    }
});

form.addEventListener("submit", (e)=> {
    e.preventDefault();
    const nickname = nicknameInput.value.trim() || "anônimo";
    const message = input.value.trim();

    if(message) {
        socket.emit("chat message", { nickname, message });
        input.value = "";
    }
});

socket.on("chat message", (data)=> {
    const { nickname, message, timestamp, color } = data;
    console.log("Cor recebida do servidor:", color);
    const item = document.createElement("li");
    item.classList.add("d-flex");

    item.innerHTML = `
        <div class="msg ${nickname.toLowerCase() === nicknameInput.value.trim().toLowerCase() ? "msg-right" : "msg-left"}">
            <strong style="color:${color}">${nickname}</strong> 
            <small>${timestamp}</small><br/>${message}
        </div>`;
    
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("user connected", (data) => {
    const item = document.createElement("li");
    item.innerHTML = `
        <em style="color:${data.color}">${data.nickname} entrou no chat.</em>`;
    item.style.fontStyle = "italic";
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("user disconnected", (data) => {
    const item = document.createElement("li");
    item.innerHTML = `
        <em style="color:${data.color}">${data.nickname} saiu do chat.</em>`;
    item.style.fontStyle = "italic";
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("update users", (users)=> {
    console.log("Usuários online recebidos:", users); // ⬅️ debug no navegador

    usersList.innerHTML = "";

    users.forEach((u)=> {
        const li = document.createElement("li");
        li.textContent = u.nickname;
        li.style.color = u.color;
        usersList.appendChild(li);
    }); 
})