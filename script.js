// Toggle password visibility
function togglePassword(id) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// SIGNUP
document.getElementById('signupForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (localStorage.getItem(email)) {
        document.getElementById('signupMessage').textContent = "Email already registered!";
    } else {
        const user = { name, email, password };
        localStorage.setItem(email, JSON.stringify(user));
        document.getElementById('signupMessage').style.color = "green";
        document.getElementById('signupMessage').textContent = "Account created successfully!";
        setTimeout(() => window.location.href = "index.html", 1500);
    }
});

// LOGIN
document.getElementById('loginForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const storedUser = localStorage.getItem(email);
    if (!storedUser) {
        document.getElementById('loginMessage').textContent = "Email not found!";
    } else {
        const user = JSON.parse(storedUser);
        if (user.password === password) {
            document.getElementById('loginMessage').style.color = "green";
            document.getElementById('loginMessage').textContent = `Welcome back, ${user.name}!`;
            // Redirect to dashboard or main page after 1s
            setTimeout(() => alert("Redirecting to main app..."), 1000);
        } else {
            document.getElementById('loginMessage').textContent = "Incorrect password!";
        }
    }
});
