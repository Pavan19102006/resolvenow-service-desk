# ResolveNow Service Desk

A microservices-based ticket management platform for logging customer grievances, assigning issues to specialized departments, and tracking resolution lifecycles.

## Architecture

```
                     ┌──────────────┐
                     │   Client     │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ API Gateway  │ :8080
                     │ (JWT Filter) │
                     └──────┬───────┘
               ┌────────────┼────────────┐─────────────┐
               │            │            │             │
        ┌──────▼──────┐ ┌──▼──────────┐ ┌▼──────────┐ ┌▼────────────┐
        │Auth Service │ │ Complaint   │ │Assignment │ │Notification │
        │   :8081     │ │ Service     │ │Service    │ │Service      │
        │             │ │   :8082     │ │  :8083    │ │   :8084     │
        └─────────────┘ └──────┬──────┘ └─────┬─────┘ └─────────────┘
                               │  REST        │  REST
                               └──────►───────└──────►
                       
        All services register with Eureka Server (:8761)
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **Eureka Server** | 8761 | Service discovery and registry |
| **API Gateway** | 8080 | Ingress routing, JWT validation, load balancing |
| **Auth Service** | 8081 | User registration, login, JWT token management |
| **Complaint Service** | 8082 | Log and track customer grievances |
| **Assignment Service** | 8083 | Assign complaints to departments |
| **Notification Service** | 8084 | Alert users on ticket updates |

## Tech Stack

- **Java 17** + **Spring Boot 3.2.0**
- **Spring Cloud 2023.0.0** (Eureka, Gateway)
- **Spring Security** + **JWT** (jjwt 0.12.3)
- **H2 Database** (in-memory per-service)
- **Maven** multi-module build
- **Docker Compose** for deployment

## Prerequisites

- Java 17+
- Maven 3.8+
- Docker & Docker Compose (for containerized deployment)

## Quick Start (Local)

### 1. Build all modules
```bash
cd resolvenow-service-desk
mvn clean package -DskipTests
```

### 2. Start services in order
```bash
# Terminal 1 — Eureka Server (wait for it to be ready)
cd eureka-server && mvn spring-boot:run

# Terminal 2 — Auth Service
cd auth-service && mvn spring-boot:run

# Terminal 3 — Complaint Service
cd complaint-service && mvn spring-boot:run

# Terminal 4 — Assignment Service
cd assignment-service && mvn spring-boot:run

# Terminal 5 — Notification Service
cd notification-service && mvn spring-boot:run

# Terminal 6 — API Gateway
cd api-gateway && mvn spring-boot:run
```

### 3. Docker Compose (alternative)
```bash
mvn clean package -DskipTests
docker-compose up --build
```

## API Usage

All requests go through the **API Gateway** at `http://localhost:8080`.

### Authentication

#### Register a user
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123","email":"john@example.com"}'
```

#### Login (get JWT token)
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123"}'
```
Response:
```json
{"token":"eyJhbGciOi...","username":"john","message":"Login successful"}
```

### Complaints (requires JWT)

#### Create a complaint
```bash
curl -X POST http://localhost:8080/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"title":"Cannot login","description":"Getting 500 error on login page","priority":"HIGH","userId":1}'
```

#### Get all complaints
```bash
curl http://localhost:8080/complaints \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Update complaint status
```bash
curl -X PUT "http://localhost:8080/complaints/1/status?status=IN_PROGRESS" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Assignments (requires JWT)

#### Get assignments for a complaint
```bash
curl http://localhost:8080/assignments/complaint/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Notifications (requires JWT)

#### Get user notifications
```bash
curl http://localhost:8080/notifications/user/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Get unread notifications
```bash
curl http://localhost:8080/notifications/user/1/unread \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Mark notification as read
```bash
curl -X PUT http://localhost:8080/notifications/1/read \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Inter-Service Communication Flow

1. **User** registers & logs in → receives **JWT token**
2. **User** creates a complaint → **Complaint Service** saves it
3. **Complaint Service** calls **Assignment Service** (via Eureka LB) to auto-assign
4. **Assignment Service** assigns to a department based on priority, then calls **Notification Service**
5. **Notification Service** stores the notification alert for the user

## Running Tests

```bash
mvn test
```

## Eureka Dashboard

Visit `http://localhost:8761` to see all registered services.

## Project Structure

```
resolvenow-service-desk/
├── pom.xml                    # Parent POM
├── docker-compose.yml         # Docker orchestration
├── eureka-server/             # Service Discovery
├── api-gateway/               # API Gateway + JWT Filter
├── auth-service/              # Authentication + JWT
├── complaint-service/         # Complaint Management
├── assignment-service/        # Department Assignment
└── notification-service/      # User Notifications
```

