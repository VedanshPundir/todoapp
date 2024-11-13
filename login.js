document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Clear previous error message
    errorMessage.textContent = '';

    // Check for the hardcoded username and password
    if (username === 'Vedansh Pundir' && password === 'Vedansh@1234') {
        localStorage.setItem('loggedIn', 'true'); // Set login status in local storage
        window.location.href = 'todo.html'; // Redirect to the todo page
    } else {
        errorMessage.textContent = 'Invalid username or password. Please try again.';
    }
});

// Function to toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password');
    if (showPasswordCheckbox.checked) {
        passwordField.type = 'text'; // Show password
    } else {
        passwordField.type = 'password'; // Hide password
    }
}

