function hasSQLInjection(input) {
    const sqlRegex = /['";#]|(--[^\r\n]*)|\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//; // Regex pattern for SQL injection characters and comments
    return sqlRegex.test(input);
}

document.addEventListener("DOMContentLoaded", function() {
    const loginLink = document.getElementById("loginLink");
    const signupLink = document.getElementById("signupLink");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");

    loginLink.addEventListener("click", function(event) {
        event.preventDefault();
        showForm(loginForm);
        hideForm(signupForm);
        hideForm(forgotPasswordForm);
        setActiveLink(loginLink);
    });

    signupLink.addEventListener("click", function(event) {
        event.preventDefault();
        showForm(signupForm);
        hideForm(loginForm);
        hideForm(forgotPasswordForm);
        setActiveLink(signupLink);
    });

    forgotPasswordLink.addEventListener("click", function(event) {
        event.preventDefault();
        showForm(forgotPasswordForm);
        hideForm(loginForm);
        hideForm(signupForm);
        setActiveLink(forgotPasswordLink);
    });

    function showForm(form) {
        form.style.display = "block";
    }

    function hideForm(form) {
        form.style.display = "none";
    }

    function setActiveLink(link) {
        const links = document.querySelectorAll('nav ul li a');
        links.forEach(function(link) {
            link.classList.remove('active');
            link.classList.remove('hovered'); // Remove the hover effect class
        });
        link.classList.add('active');
    }
});

let signupFormElement = document.getElementById('signupFormElement');

signupFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    // Perform client-side validation
    const signupError = document.getElementById('signupError');
    if (!username || !email || !password) {
        signupError.textContent = 'Please fill in all fields';
        return;
    } else if (hasSQLInjection(username) || hasSQLInjection(email) || hasSQLInjection(password)) {
        signupError.textContent = 'Input contains invalid characters';
        return;
    } else if (password.length < 8) { // Password length requirement
        signupError.textContent = 'Password must be at least 8 characters long';
        return;
    } else if (!(/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))) {
        // Password complexity requirement
        signupError.textContent = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        return;
    } else {
        signupError.textContent = '';
    }

    // Submit form securely
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Send JSON data
            },
            body: JSON.stringify({ // Send data as JSON object
                username: username,
                email: email,
                password: password
            })
        });

        if (response.ok) {
            const message = await response.json();
            signupError.style.color = '#4caf50'
            signupError.textContent = message['message'];
        } else {
            const errorMessage = await response.json();
            signupError.style.color = 'red'
            signupError.textContent = errorMessage['message']
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


let loginFormElement = document.getElementById('loginFormElement');

loginFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Perform client-side validation
    const loginError = document.getElementById('loginError');
    if (!username || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    } else if (hasSQLInjection(username) || hasSQLInjection(password)) {
        loginError.textContent = 'Input contains invalid characters';
        return;
    } else {
        loginError.textContent = '';
    }

    // Submit form securely
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Send JSON data
            },
            body: JSON.stringify({ // Send data as JSON object
                username: username,
                password: password
            })
        });

        if (response.ok) {
            window.location.href = "/dashboard";
        } else {
            const errorMessage = await response.json();
            loginError.textContent = errorMessage['message']
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

let forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');

forgotPasswordFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('forgotPasswordEmail').value;

    // Perform client-side validation
    const forgotPasswordError = document.getElementById('forgotPasswordError');
    if (!email) {
        forgotPasswordError.textContent = 'Please fill in all fields';
        return;
    } else if (hasSQLInjection(email)) {
        forgotPasswordError.textContent = 'Input contains invalid characters';
        return;
    } else {
        forgotPasswordError.textContent = '';
    }

    // Submit form securely
    try {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Send JSON data
            },
            body: JSON.stringify({ // Send data as JSON object
                email: email,
            })
        });

        if (response.ok) {
            const message = await response.json();
            forgotPasswordError.style.color = '#4caf50'
            forgotPasswordError.textContent = message['message'];
        } else {
            const errorMessage = await response.json();
            forgotPasswordError.style.color = 'red'
            forgotPasswordError.textContent = errorMessage['message']
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


