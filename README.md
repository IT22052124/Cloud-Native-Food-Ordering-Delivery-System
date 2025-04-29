# DEPLOYMENT GUIDE - CLOUD-NATIVE FOOD ORDERING & DELIVERY SYSTEM

This document provides comprehensive instructions for deploying the entire Cloud-Native Food Ordering & Delivery System, including all microservices and client applications.

## PREREQUISITES

1. Ensure you have the following tools installed:

   - Node.js (v14 or later)
   - npm (v6 or later)
   - Docker (v20 or later)
   - Docker Compose (v1.29 or later)
   - kubectl (for Kubernetes deployment)
   - Expo CLI (for mobile app deployment)
   - MongoDB (for local development)

2. Access to:
   - MongoDB instance (production or cloud)
   - Container registry (Docker Hub or private)
   - Domain names and SSL certificates for production
   - Cloud provider (AWS, Azure, GCP)

## 1. SYSTEM ARCHITECTURE OVERVIEW

The system consists of the following components:

1. **Auth Service**: User authentication and management
2. **Order Service**: Order processing and cart management
3. **Restaurant Service**: Restaurant and menu management
4. **Payment Service**: Payment processing
5. **Notification Service**: Email and push notifications
6. **Food Delivery Service**: Delivery tracking and management
7. **Admin Service**: Administrative functions and reporting
8. **Client Applications**:
   - Customer Mobile App (React Native)
   - Restaurant Web Dashboard (React.js)
   - Delivery Personnel App (React Native)
   - Admin Dashboard (React.js)

## 2. LOCAL DEVELOPMENT DEPLOYMENT

### Clone the Repository

```
git clone https://github.com/your-repo/Cloud-Native-Food-Ordering-Delivery-System.git
cd Cloud-Native-Food-Ordering-Delivery-System
```

### Start MongoDB (if using local instance)

```
mongod --dbpath=/data/db
```

### Set Up Environment Variables

Create a `.env` file in each microservice directory using the provided `.env.example` templates.

### Install Dependencies and Start Services

#### Auth Service

```
cd auth
npm install
npm run dev
```

#### Order Service

```
cd ../order
npm install
npm run dev
```

#### Restaurant Service

```
cd ../restaurant
npm install
npm run dev
```

#### Payment Service

```
cd ../payment-service
npm install
npm run dev
```

#### Notification Service

```
cd ../notification-service
npm install
npm run dev
```

#### Food Delivery Service

```
cd ../food-delivery-server
npm install
npm run dev
```

#### Admin Service

```
cd ../admin-service
npm install
npm run dev
```

### Client Applications

#### Customer Mobile App

```
cd ../foodapp-client
npm install
npx expo start
```

#### Restaurant Dashboard

```
cd ../food-delivery-restuarant-web
npm install
npm start
```

#### Delivery App

```
cd ../client-delivery-app
npm install
npx expo start
```

#### Admin Dashboard

```
cd ../food-delivery-admin
npm install
npm start
```

## 3. DOCKER DEPLOYMENT

### Using Docker Compose (Development)

1. Navigate to the root directory:

   ```
   cd Cloud-Native-Food-Ordering-Delivery-System
   ```

2. Build and start all services:

   ```
   docker-compose build
   docker-compose up
   ```

3. To stop all services:
   ```
   docker-compose down
   ```

### Building Individual Docker Images

For each microservice (auth, order, restaurant, etc.):

1. Navigate to the service directory:

   ```
   cd <service-directory>
   ```

2. Build the Docker image:

   ```
   docker build -t food-ordering/<service-name>:latest .
   ```

3. Run the container:
   ```
   docker run -p <port>:<port> --env-file .env food-ordering/<service-name>:latest
   ```

## 4. KUBERNETES DEPLOYMENT

### Prepare Infrastructure

1. Set up a Kubernetes cluster on your cloud provider:

   - AWS EKS
   - Google GKE
   - Azure AKS

2. Configure kubectl to use your cluster:
   ```
   aws eks update-kubeconfig --name your-cluster-name --region your-region
   ```
   or
   ```
   gcloud container clusters get-credentials your-cluster-name --zone your-zone
   ```

### Deploy MongoDB

1. Create persistent volume:

   ```
   kubectl apply -f kubernetes/mongodb/mongodb-pv.yaml
   ```

2. Deploy MongoDB:
   ```
   kubectl apply -f kubernetes/mongodb/mongodb-deployment.yaml
   kubectl apply -f kubernetes/mongodb/mongodb-service.yaml
   ```

### Deploy Microservices

For each microservice:

1. Push Docker images to registry:

   ```
   docker tag food-ordering/<service-name>:latest your-registry/food-ordering/<service-name>:latest
   docker push your-registry/food-ordering/<service-name>:latest
   ```

2. Update Kubernetes deployment files with image locations and environment variables.

3. Apply deployments and services:
   ```
   kubectl apply -f kubernetes/<service-name>-deployment.yaml
   kubectl apply -f kubernetes/<service-name>-service.yaml
   ```

### Deploy API Gateway

1. Apply API Gateway configuration:
   ```
   kubectl apply -f kubernetes/api-gateway/deployment.yaml
   kubectl apply -f kubernetes/api-gateway/service.yaml
   ```

### Set Up Ingress Controller

1. Install NGINX Ingress Controller:

   ```
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.0/deploy/static/provider/cloud/deploy.yaml
   ```

2. Apply Ingress rules:
   ```
   kubectl apply -f kubernetes/ingress.yaml
   ```

## 5. PRODUCTION DEPLOYMENT

### Domain Configuration

1. Register domain names for your services
2. Configure DNS records to point to your Kubernetes ingress or load balancer

### SSL Certificates

1. Obtain SSL certificates for your domains
2. Configure certificates in your ingress or load balancer

### Client Applications Deployment

#### Customer Mobile App

1. Configure production endpoints in src/config/index.js
2. Build for Android:
   ```
   expo build:android -t app-bundle
   ```
3. Build for iOS:
   ```
   expo build:ios -t archive
   ```
4. Submit to app stores

#### Web Applications (Restaurant/Admin Dashboards)

1. Configure production endpoints
2. Build production versions:
   ```
   npm run build
   ```
3. Deploy to web hosting service (Netlify, Vercel, AWS S3, etc.)

## 6. MONITORING AND MAINTENANCE

### Set Up Monitoring

1. Deploy Prometheus and Grafana:

   ```
   kubectl apply -f kubernetes/monitoring/prometheus.yaml
   kubectl apply -f kubernetes/monitoring/grafana.yaml
   ```

2. Configure alerts and dashboards

### Backup Procedures

1. MongoDB backups:

   ```
   mongodump --uri="mongodb://username:password@host:port/database" --out=/backup/directory
   ```

2. Automate backups using cronjobs

### Scaling

1. Scale deployments as needed:

   ```
   kubectl scale deployment <deployment-name> --replicas=3
   ```

2. Configure Horizontal Pod Autoscaler:
   ```
   kubectl autoscale deployment <deployment-name> --min=2 --max=5 --cpu-percent=80
   ```

## 7. TROUBLESHOOTING

### Checking Logs

```
kubectl logs deployment/<deployment-name>
```

### Debugging Services

```
kubectl exec -it <pod-name> -- /bin/bash
```

### Common Issues

1. **Service discovery problems**:

   - Verify service names and ports in environment variables
   - Check network policies

2. **Database connection issues**:

   - Verify connection strings
   - Check MongoDB credentials and access

3. **Authentication failures**:
   - Verify JWT secrets match across services
   - Check token validation endpoints

## 8. UPDATING THE SYSTEM

1. Pull latest code:

   ```
   git pull origin main
   ```

2. Rebuild Docker images:

   ```
   docker-compose build
   ```

3. Update Kubernetes deployments:

   ```
   kubectl apply -f kubernetes/<service-name>-deployment.yaml
   ```

4. Monitor rollout:

   ```
   kubectl rollout status deployment/<deployment-name>
   ```

5. Rollback if necessary:
   ```
   kubectl rollout undo deployment/<deployment-name>
   ```

## 9. SECURITY CONSIDERATIONS

1. Keep all dependencies updated
2. Regularly rotate JWT secrets and API keys
3. Monitor for suspicious activities
4. Implement rate limiting for APIs
5. Regularly backup databases
6. Use secure connections (HTTPS) for all services
7. Follow principle of least privilege for service accounts

For detailed documentation on each component, refer to the README files in individual service directories.
