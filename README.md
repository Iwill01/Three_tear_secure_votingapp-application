🗳️ 3-Tier Secure Voting Application

A secure, cloud-native voting platform designed with modern DevOps and cloud practices.

Built using:

AWS Cloud Services

Docker, Kubernetes, Jenkins, Terraform

MySQL for persistent data storage

Prometheus & Grafana for monitoring

✅ Key Features
🔐 Voter authentication & voting with secure session handling

📦 3-tier architecture (Frontend - Backend - MySQL DB)

☁️ Hosted on AWS EC2, provisioned via Terraform

🐳 Containerized using Docker

🚀 Automated CI/CD via Jenkins

⚙️ Kubernetes for scalable orchestration

📊 Live Monitoring with Prometheus + Grafana

🔧 Tech Stack
Layer	Tools/Tech
Frontend	HTML, CSS, JS (served via NGINX)
Backend	Python Flask API
Database	MySQL (votes, voters, admin credentials)
DevOps	Docker, Jenkins, Kubernetes, Terraform
Monitoring	Prometheus, Grafana
Cloud	AWS EC2 (Free Tier)

📁 Project Structure
csharp
Copy
Edit
secure-vote-app/
├── backend/                # Flask API + MySQL connection
├── frontend/               # HTML UI (index2.html)
├── mysql-init/             # DB schema + seed script
├── k8s/                    # Kubernetes manifests
├── terraform/              # Terraform IaC configs
├── monitoring/             # Prometheus config
├── docker-compose.yml
├── README.md
🚀 How to Deploy
1. 🐳 Local Development using Docker Compose
Step 1: Clone the repository
bash
Copy
Edit
git clone https://repoURL
cd secure-vote-app
Step 2: Start all services
bash
Copy
Edit
docker-compose up --build
Frontend ➝ http://localhost

Backend ➝ http://localhost:5000

MySQL ➝ Port 3306 (internal)

Prometheus ➝ http://localhost:9090

Grafana ➝ http://localhost:3000 (admin/admin)

2. 🗄️ MySQL Setup
MySQL is automatically initialized via Docker using a schema file in:

csharp
Copy
Edit
mysql-init/
├── init.sql   # Creates tables: voters, votes, elections
Add your table creation and sample voter/admin data there.

3. ☸️ Kubernetes Deployment (for AWS)
Step 1: Push Docker Images
bash
Copy
Edit
docker build -t your-dockerhub/securevote-backend backend/
docker push your-dockerhub/securevote-backend
Do the same for any custom frontend image if applicable.

Step 2: Launch Kubernetes Cluster on EC2
Provision EC2 using Terraform (below) or manually.

Step 3: Apply Kubernetes YAMLs
bash
Copy
Edit
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
4. ⚙️ Terraform (IaC for EC2 on AWS)
hcl
Copy
Edit
# terraform/main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "securevote_node" {
  ami           = "ami-0c55b159cbfafe1f0"  # Use latest Ubuntu AMI
  instance_type = "t2.micro"

  tags = {
    Name = "SecureVoteK8sNode"
  }
}
bash
Copy
Edit
cd terraform/
terraform init
terraform apply
5. 📈 Monitoring Setup
Prometheus (monitoring/prometheus.yml)
yaml
Copy
Edit
scrape_configs:
  - job_name: 'securevote-backend'
    static_configs:
      - targets: ['backend:5000']
Grafana
Login ➝ http://localhost:3000

Default ➝ admin / admin

Add Prometheus as data source and import dashboard templates.

⚙️ Backend Configuration (backend2.py)
Update the Flask backend to connect with MySQL:

python
Copy
Edit
import mysql.connector

db = mysql.connector.connect(
    host="mysql",
    user="root",
    password="rootpass",
    database="secure_vote"
)
cursor = db.cursor()
🧠 Security Strategy
🔐 Backend uses secure validation logic + SQL injection-safe queries.

🧱 Multi-tier architecture isolates frontend/backend/database.

🔄 Docker networks ensure internal communication only.

🔒 Admin login and voter sessions are authenticated via DB.

🔐 Sensitive configs can be stored as Kubernetes secrets.

🖥️ Demo
(Add screenshots or a demo video link here)

🧩 Future Enhancements
Add JWT token-based voter sessions

Enable dynamic candidate management

Replace MySQL with Amazon RDS

Integrate with AWS SNS for real-time notifications

Host static site on S3 + CloudFront

🤝 Contribute
Contributions, issues and feature requests are welcome!

bash
Copy
Edit
Fork this repo → Create a branch → Commit your changes → Open a PR
📬 Contact
Built with ❤️ by Mohammad Aasim
📧 mdaasim2701@gmail.com
🔗 LinkedIn : https://www.linkedin.com/in/mohammad-aasim-45ba78220/
