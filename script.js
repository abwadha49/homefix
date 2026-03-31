function validateLogin() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (user === "" || pass === "") {
        document.getElementById("error").innerText = "Please fill all fields";
        return false;
    }

    alert("Login Successful (Demo)");
    return true;
}
function validateRegister() {
    let user = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;

    if (user === "" || email === "" || pass === "") {
        document.getElementById("error").innerText = "All fields required";
        return false;
    }

    if (pass.length < 6) {
        document.getElementById("error").innerText = "Password must be at least 6 characters";
        return false;
    }

    alert("Registered Successfully (Demo)");
    return true;
}