document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form form");
    const signupForm = document.querySelector(".signup-form form");

    // Helper function to make API calls
    async function apiCall(url, method, data) {
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                let errorMessage = "Something went wrong!";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    console.warn("Could not parse error response as JSON.");
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (err) {
            console.error("API error:", err);
            alert(`Error: ${err.message}`);
            return null;
        }
    }

    // Signup Form Submission
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const emailId = document.getElementById("emailIds").value;
        const password = document.getElementById("passwords").value;
        const data = { firstName, lastName, emailId, password };

        const response = await apiCall("http://localhost:5000/api/signup", "POST", data);

        if (response) {
            alert("Signup successful! Please log in with your new credentials.");
            document.getElementById("flip").checked = false;
        } else {
            alert("Signup failed. Please try again.");
        }
    });

    // Login Form Submission
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailId = document.getElementById("emailId").value;
        const password = document.getElementById("password").value;
        const data = { emailId, password };

        const response = await apiCall("http://localhost:5000/api/login", "POST", data);

        // Check if login was successful by verifying response contains user data
        if (response && response.token && response.firstName && response._id) {
            localStorage.setItem('authToken', response.token); // Store token
            localStorage.setItem('userId',response._id);
            const userData = {firstName:response.firstName,
                lastName:response.lastName,
                emailId:response.emailId,
            };
            localStorage.setItem('userData', JSON.stringify(userData)); // Save userId
            alert(`Welcome, ${response.firstName}`);
            window.location.href = `../Home.html?userId=${response.userId}`; // Redirect to Home with userId
        } else if (response) {
            console.log(response);
            alert("Login successful, but user name is missing from response!");
        } else {
            alert("Login failed. Please check your credentials and try again.");
        }
    });
});
