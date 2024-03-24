function hasSQLInjection(input) {
    const sqlRegex = /['";#]|(--[^\r\n]*)|\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//; // Regex pattern for SQL injection characters and comments
    return sqlRegex.test(input);
}

let resetPasswordForm = document.getElementById('resetPasswordForm');
let accountToken = window.location.href.split('/').slice(-1)[0]

resetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newPass = document.getElementById('newPassword').value;
    const confPass = document.getElementById('confPassword').value;
    const resetPasswordError = document.getElementById('resetPasswordError');

    // Perform client-side validation

    
    if (!newPass || !confPass) {
        resetPasswordError.textContent = 'Please fill in all fields';
        return;
    } else if (newPass !== confPass) {
        resetPasswordError.textContent = 'Passwords Do Not Match';
        return;
    } else if (hasSQLInjection(newPass) || hasSQLInjection(confPass)) {
        resetPasswordError.textContent = 'Input contains invalid characters';
        return;
    } else if (newPass.length < 8) { // Password length requirement
        resetPasswordError.textContent = 'Password must be at least 8 characters long';
        return;
    } else if (!(/[A-Z]/.test(newPass) && /[a-z]/.test(newPass) && /[0-9]/.test(newPass) && /[^A-Za-z0-9]/.test(newPass))) {
        // Password complexity requirement
        resetPasswordError.textContent = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        return;
    } else {
        resetPasswordError.textContent = '';
    }

    // Submit form securely
    try {
        const response = await fetch(`/reset-password/${accountToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Send JSON data
            },
            body: JSON.stringify({ // Send data as JSON object
                newPassword: newPass
            })
        });

        if (response.ok) {
            const message = await response.json();
            resetPasswordError.style.color = '#4caf50'
            resetPasswordError.textContent = message['message'];
            setTimeout(() => {
                window.location.href = '/login'
            }, 3000)
        } else {
            const errorMessage = await response.json();
            resetPasswordError.style.color = 'red'
            resetPasswordError.textContent = errorMessage['message']
        }
    } catch (error) {
        console.error('Error:', error);
    }
});