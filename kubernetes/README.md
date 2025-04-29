# Kubernetes Deployment Guide for Food Delivery System

This guide explains how to deploy the Cloud-Native Food Ordering and Delivery System on Kubernetes.

## Prerequisites

- Kubernetes cluster (minikube, kind, cloud provider, etc.)
- kubectl installed and configured
- Docker installed (for building images)
- Docker registry to store images

## Setup Environment

1. Copy the `.env.example` file to `.env` and update it with your actual values:

```bash
cp .env.example .env
```

2. Update the DOCKER_REGISTRY value in `.env` to point to your Docker registry.

## Building and Pushing Docker Images

1. Build all service images:

```bash
# For each service
docker-compose build
```

2. Tag and push images to your registry:

```bash
export DOCKER_REGISTRY=your-registry-url

# For each service, tag and push
docker tag food-delivery_auth-service ${DOCKER_REGISTRY}/auth-service:latest
docker push ${DOCKER_REGISTRY}/auth-service:latest

# Repeat for other services
```

## Deploying to Kubernetes

1. Create the namespace and infrastructure:

```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/mongodb.yaml
kubectl apply -f kubernetes/kafka.yaml
```

2. Create secrets (first time, update values):

```bash
kubectl create -f kubernetes/secrets.yaml
```

3. Deploy all services using kustomize:

```bash
kubectl apply -k kubernetes/
```

Alternatively, you can deploy services individually:

```bash
kubectl apply -f kubernetes/auth-service.yaml
kubectl apply -f kubernetes/restaurant-service.yaml
kubectl apply -f kubernetes/order-service.yaml
# ... etc for each service
```

## Accessing the Services

Once deployed, the services are accessible through the Ingress:

- Customer App: http://app.fooddelivery.com
- Restaurant Dashboard: http://restaurant.fooddelivery.com
- Admin Dashboard: http://admin.fooddelivery.com
- API Endpoints: http://api.fooddelivery.com

Note: You'll need to configure DNS or update your hosts file to point these domains to your Ingress controller's IP address.

## Monitoring and Maintenance

Check the status of deployments:

```bash
kubectl get deployments -n food-delivery
```

Check the status of pods:

```bash
kubectl get pods -n food-delivery
```

View logs for a specific service:

```bash
kubectl logs -f deployment/auth-service -n food-delivery
```

## Scaling Services

Scale any service by updating replicas:

```bash
kubectl scale deployment/order-service --replicas=3 -n food-delivery
```

## Updating Services

To update a service with a new image version:

```bash
kubectl set image deployment/auth-service auth-service=${DOCKER_REGISTRY}/auth-service:v2 -n food-delivery
```
