<?php
// send-email.php — Handles book-online form submission and emails details to admin

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method not allowed.");
}

// Collect and sanitize form data
$firstName = filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_SPECIAL_CHARS);
$lastName  = filter_input(INPUT_POST, 'lastName',  FILTER_SANITIZE_SPECIAL_CHARS);
$phone     = filter_input(INPUT_POST, 'phone',     FILTER_SANITIZE_SPECIAL_CHARS);
$email     = filter_input(INPUT_POST, 'email',     FILTER_SANITIZE_EMAIL);
$city      = filter_input(INPUT_POST, 'city',      FILTER_SANITIZE_SPECIAL_CHARS);
$address   = filter_input(INPUT_POST, 'address',   FILTER_SANITIZE_SPECIAL_CHARS);
$human     = filter_input(INPUT_POST, 'humanVerified', FILTER_SANITIZE_SPECIAL_CHARS);

// Validate required fields
if (empty($firstName) || empty($lastName) || empty($phone) || empty($email) || empty($city) || empty($address)) {
    http_response_code(400);
    exit("Please fill in all required fields.");
}

// Validate captcha verification
if ($human !== "yes") {
    http_response_code(403);
    exit("Captcha verification failed. Please complete the security check.");
}

// Recipient
$to = "admin@iglobeservices.com";
$subject = "New Online Booking – I Globe Services";

// Build email body
$fullName = trim($firstName . " " . $lastName);

$body = <<<EMAIL
New booking request received from the website.

Name: $fullName
Phone: $phone
Email: $email
City: $city
Contact Address:
$address

Submitted via: Book Online form
EMAIL;

// Headers
$headers = "From: no-reply@iglobeservices.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// Send email
$mailSent = mail($to, $subject, $body, $headers);

if ($mailSent) {
    // Redirect back to book-online page with success flag
    header("Location: book-online.html?status=success");
    exit();
} else {
    http_response_code(500);
    exit("Failed to send email. Please try again later.");
}