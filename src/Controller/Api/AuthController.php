<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Event\UserRegisteredEvent;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class AuthController extends AbstractController
{
    private $em;
    private $passwordHasher;
    private $jwtManager;

    public function __construct(EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher, JWTTokenManagerInterface $jwtManager)
    {
        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
        $this->jwtManager = $jwtManager;
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, EventDispatcherInterface $dispatcher)
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $isAdmin = (bool)($data['is_admin'] ?? false);

        if (!$email || !$password) {
            return new JsonResponse(['error' => 'Email and password required'], 400);
        }

        if ($this->em->getRepository(User::class)->findOneBy(['email' => $email])) {
            return new JsonResponse(['error' => 'User already exists'], 400);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setIsAdmin($isAdmin);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        // 🔥 Dispatch the custom event AFTER registration
        $dispatcher->dispatch(new UserRegisteredEvent($user), UserRegisteredEvent::NAME);

        $this->em->persist($user);
        $this->em->flush();

        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'token' => $token,
            'email' => $user->getEmail(),
            'is_admin' => $user->isAdmin(),
            'roles' => $user->getRoles()
        ], 201);
    }

    #[Route('/api/login', name: 'api_login_jwt', methods: ['POST'])]
    public function login(Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return new JsonResponse(['error' => 'Email and password required'], 400);
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse(['error' => 'Invalid credentials'], 401);
        }

        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'token' => $token,
            'email' => $user->getEmail(),
            'is_admin' => $user->isAdmin(),
            'roles' => $user->getRoles()
        ], 200);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request, TokenStorageInterface $tokenStorage): JsonResponse
    {
        // Clear the Symfony security token (logged-in user)
        $tokenStorage->setToken(null);

        // Invalidate Symfony session
        $session = $request->getSession();
        if ($session && $session->isStarted()) {
            $session->invalidate();
            $session->clear();
        }

        // Remove PHP session cookie
        $response = new JsonResponse(['message' => 'Logout successful']);
        $response->headers->clearCookie('PHPSESSID');

        return $response;
    }

    #[Route('/auth/sync', name: 'auth_sync', methods: ['POST'])]
    public function sync(
        Request $request,
        JWTTokenManagerInterface $jwtManager,
        EntityManagerInterface $em,
        TokenStorageInterface $tokenStorage
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $tokenString = $data['token'] ?? null;

        if (!$tokenString) {
            return new JsonResponse(['error' => 'Token missing'], 400);
        }

        try {
            // Decode the JWT payload
            $payload = $jwtManager->parse($tokenString);
            $email = $payload['username'] ?? $payload['email'] ?? null;

            if (!$email) {
                return new JsonResponse(['error' => 'Invalid token payload'], 400);
            }

            $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);
            if (!$user) {
                return new JsonResponse(['error' => 'User not found'], 404);
            }

            // Log user into Symfony session
            $firewallName = 'main'; // Make sure this matches your firewall in security.yaml
            $token = new UsernamePasswordToken($user, $firewallName, $user->getRoles());
            $tokenStorage->setToken($token);

            // Persist token in session
            $request->getSession()->set('_security_'.$firewallName, serialize($token));
            $request->getSession()->save(); // 👈 important!

            return new JsonResponse(['status' => 'User session synchronized']);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Invalid or expired token'], 401);
        }
    }


    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me()
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        return new JsonResponse([
            'email' => $user->getEmail(),
            'is_admin' => $user->isAdmin(),
            'roles' => $user->getRoles()
        ]);
    }
}
