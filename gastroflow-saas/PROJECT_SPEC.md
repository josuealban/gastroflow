# GastroFlow SaaS - Project Specification

## Overview
GastroFlow SaaS is a multi-branch restaurant management system built to demonstrate advanced full-stack capabilities, including:
- HTTP and HTTPS fundamentals
- Client-Server Architecture
- RESTful APIs
- Multi-tenancy with dynamic database connections per branch
- Microservices communicating via TCP
- Role-Based Access Control (RBAC)

## Architecture
The system consists of 4 independent projects:
1. `api-gateway`: HTTP entry point.
2. `core-service`: Business logic and multi-tenant DB manager.
3. `audit-service`: Security and operational auditing.
4. `frontend`: React-based user interface.
