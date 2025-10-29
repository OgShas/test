<?php
// src/EventListener/UserRegisteredListener.php
namespace App\EventListener;

use App\Event\UserRegisteredEvent;

class UserRegisteredListener
{
    public function onUserRegistered(UserRegisteredEvent $event): void
    {
        $user = $event->getUser();

        // Example: send a welcome message
        // You can replace this with email, logging, or any script you want
        // For now, just output to logs or console
        // If using console: echo "Welcome {$user->getEmail()}!"; (not recommended for web)
        // Better: use logger

//        $user->setRoles(['ROLE_USER']);
        error_log("Welcome {$user->getEmail()}! Your registration is complete.");
    }
}
