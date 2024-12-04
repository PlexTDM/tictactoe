const socket = io();


const modal1 = document.getElementById("createModal");
const modal2 = document.getElementById("joinModal");
const btn = document.getElementById("createBtn");
const btn2 = document.getElementById("joinBtn");

const close1 = document.getElementsByClassName("close")[0];
const close2 = document.getElementsByClassName("close")[1];

const createName = document.getElementById('createName');

const activeRooms = document.getElementById('activeRooms');
const enterForm = document.getElementById('enterGame');
const codeInput = document.getElementById('code');

let loading = false;

const toast = Toastify({
    text: "Added to Cart",
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    onClick: () => toast.hideToast()
})

// create Modal
// btn.onclick = () => {
//     modal1.style.display = "flex";
// }
// close1.onclick = () => {
//     modal1.style.display = "none";
// }
// join Modal
btn2.onmouseup = () => {
    modal2.style.display = "flex";
}
close2.onclick = () => {
    modal2.style.display = "none";
}
window.onclick = (event) => {
    if (event.target == modal1) {
        modal1.style.display = "none";
        modal2.style.display = "none";
    }
}

socket.on('message', message => {
    toast.showToast(message);
});


// create room
const createRoom = () => {
    socket.emit('createRoom', createName.value);
    loading = true;
};

socket.on('createRoom', id => {
    loading = false;
    window.location.href = "/game?id=" + id;

})


// enter room

const joinRoom = id => {
    console.log('req sent')
    socket.emit('getRooms', id)
}

socket.on('getRooms', id => {
    if (id === false) return;
    window.location.href = "/game?id=" + id;
})

enterForm.addEventListener('submit', e => {
    e.preventDefault()
    joinRoom(codeInput.value)
})

codeInput.addEventListener('keydown', e => {
    if (
        !e.key.match(/^[a-zA-Z]$/) &&
        !['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)
    ) {
        e.preventDefault();
    }
    codeInput.value = codeInput.value.replace(/[^A-Za-z]/g, '').substring(0, 4);
    if (codeInput.value.length !== 4) {
        return
    }
    if (e.key === 'Enter') {
        joinRoom(codeInput.value)
    }
});