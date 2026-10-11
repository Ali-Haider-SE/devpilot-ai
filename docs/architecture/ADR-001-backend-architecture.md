# ADR-001 Backend architecture
Status: accepted. Modular monolith (NestJS) with Controller → Service → Repository layering; heavy work via BullMQ workers
(later phases). Extraction of services stays possible because modules communicate through services/events, not shared state.
Health and readiness report real dependency state; no simulated results anywhere.
