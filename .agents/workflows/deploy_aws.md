---
description: Deploy HireSense (Redrob) project to AWS using Docker, ECR, and ECS/Fargate
---

## Prerequisites
1. AWS CLI installed & configured (`aws configure`).
2. Docker Desktop (or Docker Engine) installed.
3. An AWS account with permissions to create ECR, ECS, RDS, IAM, and CloudWatch resources.
4. Node.js (v20+) and npm installed locally.

## Steps
1. **Create an ECR repository for the backend**
   ```bash
   aws ecr create-repository --repository-name hiresense-backend --image-scanning-configuration scanOnPush=true
   ```
2. **Create an S3 bucket for the frontend static files**
   ```bash
   aws s3api create-bucket --bucket hiresense-frontend --region <region> --acl public-read
   ```
3. **Build the frontend for production**
   ```bash
   cd client
   npm install
   npm run build   # Vite outputs to ./dist
   ```
4. **Upload the built assets to S3**
   ```bash
   aws s3 sync dist/ s3://hiresense-frontend/ --acl public-read
   ```
5. **Write a Dockerfile for the backend** (already added at `server/Dockerfile`).
6. **Build and push the backend image**
   ```bash
   cd server
   docker build -t hiresense-backend .
   $(aws ecr get-login --no-include-email --region <region>)
   docker tag hiresense-backend:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/hiresense-backend:latest
   docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/hiresense-backend:latest
   ```
7. **Create an RDS PostgreSQL instance** (or use existing DB)
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier hiresense-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password <StrongPassword> \
     --allocated-storage 20
   ```
8. **Create IAM role for ECS task execution** (`ecs-trust-policy.json` provided separately).
   ```bash
   aws iam create-role \
     --role-name hiresenseEcsTaskExecutionRole \
     --assume-role-policy-document file://ecs-trust-policy.json
   aws iam attach-role-policy \
     --role-name hiresenseEcsTaskExecutionRole \
     --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
   ```
9. **Define an ECS task definition** (`ecs-task-def.json` provided separately) and register it:
   ```bash
   aws ecs register-task-definition --cli-input-json file://ecs-task-def.json
   ```
10. **Create an ECS cluster and service**
    ```bash
    aws ecs create-cluster --cluster-name hiresense-cluster
    aws ecs create-service \
      --cluster hiresense-cluster \
      --service-name hiresense-service \
      --task-definition hiresense-backend \
      --desired-count 1 \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[<subnet-id>],securityGroups=[<sg-id>],assignPublicIp=ENABLED}"
    ```
11. **(Optional) Set up an Application Load Balancer** and point a domain to it.
12. **Verify deployment** – access the S3 static site URL and the backend API via the ALB.
13. **(Optional) Add a GitHub Actions CI/CD workflow** to automate rebuilds and deployments.

---
*Please provide the AWS region you wish to use, your AWS account ID, and whether you already have an RDS instance or need a new one. If you’d like the additional supporting files (`ecs-trust-policy.json`, `ecs-task-def.json`, and a sample GitHub Actions workflow), let me know and I’ll create them.*
