# Multi-Tenant Business Platform

## Overview

This is a comprehensive multi-tenant business platform supporting three distinct brands (SudoTechServe, SwitchToSwag, StrongTermStrategy) with a unified frontend dashboard and integrated backend services. The application serves as a central hub for managing portfolio, CMS, e-commerce, and business operations across multiple tenants.

The platform is built as a modular monolith with future microservices evolution in mind, featuring tenant-specific customization, real-time data synchronization, and comprehensive business process automation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern React application with TypeScript for type safety
- **Vite**: Fast build tool and development server with hot module replacement
- **Shadcn/UI + Tailwind CSS**: Component library built on Radix UI primitives with utility-first styling
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **Wouter**: Lightweight client-side routing
- **Zustand**: Simple state management for tenant switching and user preferences

### Backend Architecture
- **Express.js**: RESTful API server with TypeScript support
- **Modular Monolith**: Domain-driven architecture with clear separation of concerns
- **Multi-tenant Design**: Schema-per-tenant isolation with tenant routing
- **In-memory Storage**: Current implementation using Map-based storage (designed for easy database migration)
- **Service Layer**: Abstracted integration clients for external systems

### Database Design
- **PostgreSQL**: Primary database with schema-per-tenant architecture
- **Drizzle ORM**: Type-safe database queries and migrations
- **Neon Database**: Serverless PostgreSQL provider for production deployments
- **Multi-tenant Schema**: Separate schemas for each tenant ensuring data isolation

### Authentication & Authorization
- **Tenant-based Authentication**: User authentication scoped to specific tenants
- **Role-based Access Control**: User roles with granular permissions
- **Session Management**: Secure session handling with PostgreSQL session store

### Integration Architecture
- **ERPNext Integration**: REST API client for manufacturing, procurement, and accounting operations
- **Saleor Integration**: GraphQL client for e-commerce and product management
- **Webhook Support**: Real-time data synchronization between external systems
- **Integration Logging**: Comprehensive audit trail for all external API interactions

### Multi-tenant Strategy
- **Tenant Isolation**: Complete data separation using database schemas
- **Dynamic Routing**: Tenant-aware API routing based on subdomain or path
- **Customizable Modules**: Tenant-specific feature sets and UI customization
- **Shared Infrastructure**: Common services with tenant-specific configurations

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

### Business System Integrations
- **ERPNext v15.78.1**: Enterprise resource planning for manufacturing, procurement, stock management, and accounting
- **Saleor**: Headless e-commerce platform for product catalog, orders, and inventory management

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled React components
- **Shadcn/UI**: Pre-built component library based on Radix UI with Tailwind styling
- **Lucide React**: Modern icon library with consistent design

### Development Tools
- **TypeScript**: Static type checking and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tools

### Deployment & Infrastructure
- **Vercel**: Frontend deployment platform with automatic deployments
- **Docker**: Containerization for backend services and external integrations
- **Vite**: Development server with hot reload and optimized production builds

### Additional Services
- **Date-fns**: Date manipulation and formatting utilities
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Form state management with validation
- **Class Variance Authority**: Utility for creating variant-based component APIs