function showToast(message, type = "success") {
    const oldToast = document.querySelector(".site-toast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.className = `site-toast ${type}`;

    toast.innerHTML = `
        <span class="toast-icon">
            ${type === "success" ? "✓" : "!"}
        </span>

        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);
}

window.showToast = showToast;