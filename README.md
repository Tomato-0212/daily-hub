
# 🚀 Daily Hub — ENG23 3074

> ระบบจัดการงาน (Task Management) สร้างด้วย HTML/CSS/JavaScript (Frontend) และ Node.js/Express (Backend) เชื่อมต่อ PostgreSQL containerize ด้วย Docker และ deploy บน Kubernetes (KIND) ผ่าน Jenkins pipeline แบบอัตโนมัติบน DigitalOcean

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| B6613747 | ชื่อ ธานัท วรกันทรากร | Git, App Development |
| B6612726 | ชื่อ วชิระ เเก้วเมือง | Terraform, Ansible |
| B6616052 | ชื่อ วรวุฒิ ทัศน์ทอง | Jenkins, Docker |
| B6639105 | ชื่อ นพวิศิษฏ์ ผลงาม | Kubernetes, Monitoring |

---

## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **ชื่อ:** Daily Hub
- **ประเภท:** Web App
- **ภาษา / Framework:** HTML, CSS, JavaScript (Frontend) · Node.js/Express (Backend) · PostgreSQL (Database)
- **คำอธิบาย:** แอปพลิเคชันสำหรับสร้างและจัดการรายการงาน (Task) รองรับการเพิ่ม แก้ไข ลบ และกำหนด priority (low / med / high) พร้อม expose metrics ให้ Prometheus เก็บข้อมูลแบบ real-time

### Architecture Diagram

```
Developer
    │
    ▼  git push
 GitHub ──────────────────────▶ Jenkins
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
    [wsl-node]                 [infra-ops]               [build-fe/be]
    Checkout                   Terraform                 Docker Build
    Push Hub                   Ansible                   (Parallel)
    Cleanup
                                    │ Provision
                                    ▼
                         DigitalOcean Droplet
                         (143.198.215.184)
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                     Terraform             Ansible
                   (DO Droplet)    ┌───────────┴──────────┐
                                   ▼          ▼           ▼
                              Health      Setup       Delivery
                              Check    (Docker+K8s)  (kubectl apply)
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │    KIND Kubernetes Cluster     │
                    │                               │
                    │  namespace: myapp             │
                    │  ┌──────────┐ ┌──────────┐   │
                    │  │Frontend  │ │ Backend  │   │
                    │  │ :30080   │ │ :30003   │   │
                    │  └──────────┘ └──────────┘   │
                    │         │           │         │
                    │         └─────┬─────┘         │
                    │               ▼               │
                    │  ┌────────────────────────┐   │
                    │  │  PostgreSQL (ClusterIP) │   │
                    │  └────────────────────────┘   │
                    │                               │
                    │  namespace: monitoring        │
                    │  ┌────────────────────────┐   │
                    │  │   Node Exporter :30100  │   │
                    │  └────────────────────────┘   │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
                Prometheus                       Grafana
              (docker-compose)               (docker-compose)
              scrape: 9090, 30100, 30003      dashboard: 3000
```

---

## 📁 โครงสร้าง Repository

```
daily-hub/
├── app/
│   ├── frontend/
│   │   ├── index.html              # หน้าเว็บหลัก
│   │   ├── script.js               # ตรรกะ UI และเรียก Backend API
│   │   ├── style.css               # CSS styling
│   │   └── Dockerfile              # สร้าง image สำหรับ nginx serve
│   │
│   └── backend/
│       ├── server.js               # Express server + Prometheus middleware + routes
│       ├── db.js                   # PostgreSQL connection pool
│       ├── package.json            # Node.js dependencies
│       ├── Dockerfile              # สร้าง image สำหรับ Node.js
│       ├── controllers/
│       │   └── taskController.js   # business logic ของ task endpoints
│       ├── repository/
│       │   └── taskRepo.js         # database query functions
│       └── routes/
│           └── tasks.js            # task API route definitions
│
├── database/
│   ├── init.sql                    # สร้างตาราง tasks + seed data
│   └── docker-compose.yaml         # รัน PostgreSQL สำหรับ local dev
│
├── k8s/
│   ├── namespace.yaml              # namespace: myapp, monitoring
│   ├── frontend/
│   │   ├── deploy.yaml             # Frontend deployment (1 replica)
│   │   └── service.yaml            # NodePort :30080
│   ├── backend/
│   │   ├── deploy.yaml             # Backend deployment (1 replica, init container รอ DB)
│   │   └── service.yaml            # NodePort :30003
│   ├── database/
│   │   ├── deploy.yaml             # PostgreSQL deployment
│   │   ├── service.yaml            # ClusterIP (internal only)
│   │   ├── pvc.yaml                # Persistent Volume Claim
│   │   ├── secret.yaml             # DB credentials
│   │   └── configmap.yaml          # DB configuration
│   └── monitoring/
│       └── node_exporter.yaml      # Node Exporter DaemonSet + NodePort :30100
│
├── terraform/
│   ├── main.tf                     # สร้าง DigitalOcean Droplet + assign project
│   ├── variables.tf                # ตัวแปร input
│   ├── outputs.tf                  # output: droplet IP, ID, status
│   ├── provider.tf                 # DigitalOcean provider config
│   └── backend.tf                  # remote state backend
│
├── ansible/
│   ├── inventory/
│   │   └── static.ini              # IP ของ VM เป้าหมาย
│   ├── setup/
│   │   ├── docker.yaml             # ติดตั้ง Docker
│   │   ├── k8s-kind.yaml           # ติดตั้ง KIND + สร้าง cluster
│   │   └── kind-config.yaml        # KIND cluster configuration
│   ├── delivery/
│   │   └── k8s-deploy.yaml         # copy manifests + inject image tag + kubectl apply
│   └── cleanup/
│       └── k8s-kind.yaml           # ลบ KIND cluster
│
├── monitoring/
│   ├── prometheus.yaml             # scrape config (self, node-exporter, backend)
│   └── docker-compose.yaml         # รัน Prometheus + Grafana ด้วย Docker Compose
│
└── Jenkinsfile                     # CI/CD pipeline ทุก stage
```

---

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ source code |
| Node.js | ≥ 18.x | รัน backend บนเครื่อง |
| Docker | ≥ 24.x | สร้างและรัน container |
| Docker Compose | ≥ 2.x | รัน local database / monitoring |
| Jenkins | ≥ 2.4xx | ระบบ CI/CD automation |
| Terraform | ≥ 1.x | Provision infrastructure |
| Ansible | ≥ 2.15 | Configure environment บน VM |
| kubectl | ≥ 1.28 | สั่งงาน Kubernetes cluster |

> Jenkins ต้องตั้งค่า agent ที่มี label: `wsl-node`, `infra-ops`, `build-fe`, `build-be`

---

## 🏃 วิธีรันโปรเจค (Quick Start)

### 1. Clone Repository
```bash
git clone https://github.com/Worawut2547/daily-hub.git
cd daily-hub
```

### 2. รัน Database บนเครื่อง
```bash
cd database
docker compose up -d
# PostgreSQL รันที่ localhost:5432
```

### 3. รัน Backend
```bash
cd app/backend
npm install
node server.js
# API รันที่ http://localhost:3003
```

### 4. เปิด Frontend
```bash
# เปิด app/frontend/index.html ใน browser โดยตรง
# หรือใช้ local server:
cd app/frontend
npx http-server -p 8080
# เปิดที่ http://localhost:8080
```

### 5. Build และรันด้วย Docker (ทดสอบก่อน push)
```bash
# Backend
docker build -t daily-hub-be:test ./app/backend
docker run -p 3003:3003 daily-hub-be:test

# Frontend
docker build -t daily-hub-fe:test ./app/frontend
docker run -p 8080:80 daily-hub-fe:test
```

---

## 🔄 CI/CD Pipeline (Jenkins)

### ลำดับการทำงานของ Pipeline

```
Checkout ──▶ Terraform ──▶ Health Check ──▶ Ansible Setup ──▶ Build (parallel) ──▶ Push ──▶ Deploy ──▶ Cleanup
```

| Stage | Agent | คำอธิบาย |
|-------|-------|----------|
| **Checkout** | `wsl-node` | git clone จาก GitHub ด้วย github-token credentials |
| **Infra: Terraform** | `infra-ops` | terraform init → plan → apply (ข้ามถ้า no changes) |
| **Infra: Ansible Health Check** | `infra-ops` | ansible -a "uptime" ตรวจสอบว่า VM ตอบสนอง |
| **Infra: Ansible Setup** | `infra-ops` | ตรวจและติดตั้ง Docker + KIND ถ้ายังไม่มี |
| **Build Frontend** *(parallel)* | `build-fe` | docker build → `daily-hub-fe:v{N}` |
| **Build Backend** *(parallel)* | `build-be` | docker build → `daily-hub-be:v{N}` |
| **Push to Docker Hub** | `wsl-node` | retag → push `worawut2547/cloud-project:daily-hub-{fe/be}-v{N}` |
| **Infra: Ansible Delivery** | `infra-ops` | copy k8s/ → inject image tag → kubectl apply |
| **Cleanup** | `wsl-node` | docker rmi ลบ local images + docker logout |

### Conditional Flow (Smart-Skip Logic)

```
[1] Checkout
     │
     ▼
[2] Terraform Init → Plan
     │
     ├── no changes ──────────────────────────────────▶ SKIP Apply
     │                                                      │
     └── has changes ──▶ terraform apply                    │
                               │                            │
                               └──────────────┬─────────────┘
                                              ▼
                                   [3] Ansible Health Check
                                       ansible -a "uptime"
                                              │
                                              ▼
                                   [4] Ansible Setup
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                        Check Docker    Check K8s        (ถ้าครบแล้ว)
                              │               │               │
                         ✗ ──▶ Install   ✗ ──▶ Install   ✓ ──▶ SKIP
                         ✓ ──▶ SKIP      ✓ ──▶ SKIP
                              │               │               │
                               └──────────────┴───────────────┘
                                              │
                                              ▼
                               [5] Build Parallel
                          ┌───────────────────────────────┐
                          ▼                               ▼
                   Build Frontend                  Build Backend
                   (build-fe agent)               (build-be agent)
                          │                               │
                          └───────────────┬───────────────┘
                                          ▼
                                 [6] Push to Docker Hub
                                          │
                                          ▼
                                [7] Ansible Delivery
                                  copy k8s manifests
                                  inject image_tag
                                  kubectl apply
                                          │
                                          ▼
                                     [8] Cleanup
                                  docker rmi + logout
```

### Jenkins Credentials ที่ต้องตั้งค่า

| Credential ID | ประเภท | ใช้สำหรับ |
|---------------|--------|----------|
| `github-token` | Username/Password | git clone จาก GitHub |
| `docker-token` | Username/Password | docker login → push image |
| `do-api-token` | Secret text | Terraform สร้าง Droplet |
| `do-project-id` | Secret text | Terraform assign project |
| `do-admin-username` | Secret text | Ansible SSH user |
| `do-ssh-key-id` | Secret text | SSH key ID ใน DigitalOcean |
| `do-pvt-key-path` | Secret text | path ของ SSH private key บน Jenkins agent |

---

## 🏗️ Infrastructure as Code

### Terraform — Provision DigitalOcean Droplet

```bash
cd terraform
terraform init      # ดาวน์โหลด DigitalOcean provider plugin
terraform plan      # ตรวจสอบว่าจะสร้างอะไรบ้าง
terraform apply     # สร้าง Droplet จริง
```

**สิ่งที่ Terraform สร้าง:**
- DigitalOcean Droplet 1 เครื่อง พร้อม cloud-init script สร้าง admin user + ตั้งค่า SSH
- Assign Droplet ไปยัง DigitalOcean Project ที่กำหนด

> ⚠️ `lifecycle { ignore_changes = [...] }` ป้องกัน Terraform destroy/recreate VM ถ้า config เล็กน้อยเปลี่ยน

### Ansible — Configure Environment + Deploy

| Playbook | คำสั่ง | ทำอะไร |
|----------|--------|--------|
| `setup/docker.yaml` | `ansible-playbook -i inventory/static.ini setup/docker.yaml` | ติดตั้ง Docker บน VM |
| `setup/k8s-kind.yaml` | `ansible-playbook -i inventory/static.ini setup/k8s-kind.yaml` | ติดตั้ง KIND + สร้าง cluster |
| `delivery/k8s-deploy.yaml` | รันผ่าน Jenkins อัตโนมัติ | copy manifests + inject image tag + kubectl apply |

> ⚠️ ใน pipeline จริง Jenkins เรียก Terraform และ Ansible อัตโนมัติ ไม่ต้องรันด้วยมือ

---

## ☸️ Kubernetes Deployment

### Apply Manifests ด้วยตัวเอง

```bash
# สร้าง namespace
kubectl apply -f k8s/namespace.yaml

# Deploy Database (ก่อน backend เสมอ)
kubectl apply -R -f k8s/database/

# Deploy Backend
kubectl apply -R -f k8s/backend/

# Deploy Frontend
kubectl apply -R -f k8s/frontend/

# Deploy Node Exporter
kubectl apply -f k8s/monitoring/node_exporter.yaml
```

### ตรวจสอบสถานะ

```bash
kubectl get pods -n myapp
kubectl get svc  -n myapp
kubectl get pods -n monitoring
```

### ผลลัพธ์ที่ควรจะได้

```
NAME                                   READY   STATUS    RESTARTS   AGE
backend-deployment-xxxxxxxxx-xxxxx     1/1     Running   0          2m
frontend-deployment-xxxxxxxxx-yyyyy    1/1     Running   0          2m
database-deployment-xxxxxxxxx-zzzzz    1/1     Running   0          2m

NAME           TYPE       CLUSTER-IP      PORT(S)          AGE
frontend-svc   NodePort   10.96.x.x       80:30080/TCP     2m
backend-svc    NodePort   10.96.x.x       3003:30003/TCP   2m
database-svc   ClusterIP  10.96.x.x       5432/TCP         2m
```

### เข้าถึงแอปพลิเคชัน

| ส่วน | URL |
|------|-----|
| Frontend | `http://<vm_ip>:30080` |
| Backend API | `http://<vm_ip>:30003` |
| Backend Metrics | `http://<vm_ip>:30003/metrics` |
| Node Exporter | `http://<vm_ip>:30100/metrics` |

---

## 📊 Monitoring

### รัน Prometheus + Grafana

```bash
cd monitoring
docker compose up -d
```

| Service | URL |
|---------|-----|
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` |

### Prometheus Scrape Targets

| Job | Target | เก็บข้อมูลอะไร |
|-----|--------|---------------|
| `prometheus` | `localhost:9090` | Prometheus self-metrics |
| `vm-node-exporter` | `<vm_ip>:30100` | CPU, RAM, Disk, Network ของ VM |
| `backend-api` | `<vm_ip>:30003/metrics` | HTTP request rate, latency, error rate |

Scrape interval: **15 วินาที**

### Panels ใน Grafana Dashboard

| Panel | PromQL | แสดงข้อมูลอะไร |
|-------|--------|----------------|
| Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Error Rate | `rate(http_requests_total{status=~"5.."}[1m])` | จำนวน HTTP 5xx ต่อวินาที |
| Latency (p95) | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` | response time ที่ percentile 95 |
| CPU Usage | `100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)` | CPU usage ของ VM (%) |
| Memory Usage | `(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100` | RAM usage ของ VM (%) |

---

## 🧪 API Endpoints

Base URL: `http://<vm_ip>:30003`

| Method | Path | คำอธิบาย |
|--------|------|----------|
| `GET` | `/` | Health check — ตรวจว่า API ยังทำงานอยู่ |
| `GET` | `/metrics` | Prometheus metrics endpoint |
| `GET` | `/api/tasks` | ดึงรายการงานทั้งหมด |
| `POST` | `/api/tasks` | สร้างงานใหม่ |
| `PUT` | `/api/tasks/:id` | แก้ไขงานตาม id |
| `DELETE` | `/api/tasks/:id` | ลบงานตาม id |

**ตัวอย่าง Request Body (POST/PUT):**
```json
{
  "title": "ส่งรายงาน",
  "priority": "high"
}
```

---

## 🌿 Branching Strategy

| Branch | Protected | คำอธิบาย |
|--------|-----------|----------|
| `main` | ✅ | branch หลัก — trigger pipeline อัตโนมัติเมื่อ push |

---

## 🐛 Troubleshooting

**Backend Pod ค้างที่ `Init:0/1` ไม่ยอม Running**
```bash
kubectl describe pod <pod-name> -n myapp
# initContainer wait-for-db รอ database-svc:5432 — ตรวจว่า database pod Running ก่อน
kubectl get pods -n myapp
```

**Pods ค้างที่ `Pending`**
```bash
kubectl describe pod <pod-name> -n myapp
# ดูที่ Events: อาจเกิดจาก image pull error หรือ resource ไม่พอ
```

**Jenkins pipeline ล้มเหลวตอน Docker Build**
```bash
# ตรวจว่า Docker daemon รันอยู่บน agent
sudo systemctl start docker
# เพิ่ม jenkins user เข้า docker group
sudo usermod -aG docker jenkins
```

**Prometheus แสดง target เป็น DOWN**
```bash
# ตรวจว่า backend /metrics ตอบสนอง
curl http://<vm_ip>:30003/metrics
# ตรวจว่า node-exporter pod รันอยู่
kubectl get pods -n monitoring
```

**Terraform apply ล้มเหลว (credentials error)**
```bash
# ตรวจว่า Jenkins credentials ครบทุก ID ที่ Jenkinsfile ใช้
# ดู Jenkinsfile บรรทัด environment { TF_VAR_* = credentials('...') }
```

---

## 📚 เอกสารอ้างอิง

- [Jenkinsfile Declarative Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Terraform DigitalOcean Provider](https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [KIND — Kubernetes IN Docker](https://kind.sigs.k8s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [express-prometheus-middleware](https://github.com/jochen-schweizer/express-prometheus-middleware)
