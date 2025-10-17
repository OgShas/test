<?php
namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

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
    public function register(Request $request)
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
        $user->setIsAdmin($isAdmin); // Make sure User entity has getIsAdmin/setIsAdmin
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

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
