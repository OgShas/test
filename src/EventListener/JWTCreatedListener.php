<?php
namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;

class JWTCreatedListener
{
    public function __invoke(JWTCreatedEvent $event)
    {
        $user = $event->getUser();
        $payload = $event->getData();

        $payload['is_admin'] = $user->isAdmin();
        $payload['email'] = $user->getEmail();

        $event->setData($payload);
    }
}
