<?php
// send-contact.php — Handles the "Get in Touch" contact form and emails the admin.

header("Content-Type: application/json; charset=UTF-8");

function respond($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(array("success" => $success, "message" => $message));
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(false, "Method not allowed.", 405);
}

$name    = trim(filter_input(INPUT_POST, "name", FILTER_SANITIZE_SPECIAL_CHARS) ?? "");
$email   = trim(filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL) ?? "");
$phone   = trim(filter_input(INPUT_POST, "phone", FILTER_SANITIZE_SPECIAL_CHARS) ?? "");
$message = trim(filter_input(INPUT_POST, "message", FILTER_SANITIZE_SPECIAL_CHARS) ?? "");
$human   = filter_input(INPUT_POST, "humanVerified", FILTER_SANITIZE_SPECIAL_CHARS);

if ($name === "" || $email === "" || $phone === "" || $message === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "Please fill in all fields with valid details.", 400);
}

if ($human !== "yes") {
    respond(false, "Captcha verification failed. Please select the plane.", 403);
}

$to      = "admin@iglobeservices.com";
$subject = "New Contact Enquiry - I Globe Services";
$body    = "New message received from the Get in Touch form.\r\n\r\n"
         . "Name: $name\r\n"
         . "Phone: $phone\r\n"
         . "Email: $email\r\n\r\n"
         . "Message:\r\n$message\r\n";

$headers  = "From: no-reply@iglobeservices.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

if (mail($to, $subject, $body, $headers)) {
    respond(true, "Thank you for contacting us!");
}

respond(false, "Failed to send your message. Please try again later.", 500);
