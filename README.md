# 🚀 daily-standup-hub — ENG23 3074

> _อธิบายโปรเจคสั้น ๆ ในประโยคเดียว_  
> ระบบบันทึก Daily Standup สร้างด้วย Node.js/Express backend, JavaScript frontend, PostgreSQL database, containerize ด้วย Docker และ deploy บน Kubernetes ผ่าน Jenkins pipeline แบบอัตโนมัติ

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| 6616052  | ชื่อ วรวุฒิ ทัศน์ทอง | Git, App Development |
| 6612726 | ชื่อ วชิระ แก้วเมือง | Jenkins, Docker |
| 6639105 | ชื่อ นพวิศิษฏ์ ผลงาม | Terraform, Ansible |
| 6613747 | ชื่อ ธานัท วรกันทรากร | Kubernetes, Monitoring |

---

## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **ชื่อ:** daily-standup-hub
- **ประเภท:** Web App
- **ภาษา / Framework:** HTML, CSS, JavaScript, Node.js/Express (Backend), PostgreSQL (Database)
- **คำอธิบาย:** แอปพลิเคชันสำหรับบันทึกและติดตาม Daily Standup ช่วยให้สมาชิกแต่ละคนสามารถอัปเดตความคืบหน้า งานที่ทำอยู่ และ blockers ได้อย่างรวดเร็ว โปร่งใส และเข้าถึงได้จากทุกที่

### Architecture Diagram
```
Architecture Diagram
Developer
    │
    ▼  git push
 GitHub ──── webhook ────▶ Jenkins CI/CD
                                │
                                ▼
                      Trigger Parallel Build
                      ┌─────────────────────┐
                      ▼                     ▼
               agent 1                agent 2
            Build Frontend          Build Backend
                      │                     │
                      └──────────┬──────────┘
                                 ▼
                          Build Completed
                      ┌─────────────────────┐
                      ▼                     ▼
               agent 3                agent 4
          Deploy Frontend          Deploy Backend
          kubectl apply            kubectl apply
                      │                     │
                      └──────────┬──────────┘
                                 ▼
                    ┌────────────────────────┐
                    │        VM App          │
                    │   Kubernetes Cluster   │
                    │  ┌──────────────────┐  │
                    │  │  Control Plane   │  │
                    │  └──────────────────┘  │
                    │  ┌──────┬──────┬─────┐ │
                    │  │ W-1  │ W-2  │ W-3 │ │
                    │  └──────┴──────┴─────┘ │
                    │                        │
                    │  Pod 1: Frontend       │
                    │  Pod 2: Backend        │
                    │  Pod 3: Database       │
                    │                        │
                    │  Service (NodePort     │
                    │          :30000)       │
                    └────────────────────────┘
                                 │
                    http://<vm_ip>:30000
                                 │
                   ┌─────────────┴──────────────┐
                   ▼                             ▼
               Prometheus  ──────────────▶  Grafana
             (scrape /metrics)            (dashboard)

CI/CD + Infrastructure Flow
┌─────────────────────────────────────────────────────────┐
│  มี VM อยู่รึไม่ ? (terraform state)                         │
│      ├── ไม่มี ──▶ Create VM                             |
│      └── มี    ──▶ ข้ามขั้นตอน                             │
│                                                         │
│  Docker Installed ? (ansible check)                     │
│      ├── ไม่มี ──▶ Install Docker + Kubernetes           │
│      └── มี    ──▶ ข้ามขั้นตอน                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 โครงสร้าง Repository

```
daily-hub/
├── app/
│   ├── frontend/
│   │   ├── index.html             # HTML หลัก
│   │   ├── script.js              # JavaScript frontend logic
│   │   ├── style.css              # CSS styling
│   │   └── Dockerfile             # คำสั่งสร้าง Docker image frontend
│   │
│   ├── backend/
│   │   ├── server.js              # โค้ดหลักของ Express server
│   │   ├── db.js                  # ตั้งค่า PostgreSQL connection
│   │   ├── package.json           # Node.js dependencies
│   │   ├── Dockerfile             # คำสั่งสร้าง Docker image backend
│   │   ├── controllers/
│   │   │   └── taskController.js  # Business logic สำหรับ task endpoints
│   │   ├── repository/
│   │   │   └── taskRepo.js        # Database query functions
│   │   └── routes/
│   │       └── tasks.js           # Task API routes definitions
│   │
│   └── docker-compose.yaml        # Local development with Docker Compose
│
├── database/
│   ├── docker-compose.yaml        # PostgreSQL Docker setup
│   └── init.sql                   # Database initialization script
│
├── Jenkinsfile                    # กำหนด CI/CD pipeline ทุก stage
│
├── terraform/
│   ├── main.tf                    # กำหนด resource ที่จะ provision
│   ├── variables.tf               # ตัวแปร input
│   ├── outputs.tf                 # ค่า output หลัง apply
│   ├── provider.tf                # ตั้งค่า terraform provider
│   └── backend.tf                 # Backend configuration
│
├── ansible/
│   ├── inventory/
│   │   └── static.ini             # รายชื่อ host เป้าหมาย
│   ├── setup/
│   │   ├── docker.yaml            # Install Docker playbook
│   │   ├── k8s-kind.yaml          # Install Kubernetes playbook
│   │   └── kind-config.yaml       # Kind cluster configuration
│   ├── cleanup/
│   │   └── k8s-kind.yaml          # Cleanup script
│   └── ansible.cfg                # Ansible configuration
│
├── k8s/
│   ├── namespace.yaml             # Kubernetes namespace
│   ├── frontend/
│   │   ├── deploy.yaml            # Frontend deployment manifest
│   │   └── service.yaml           # Frontend service manifest
│   ├── backend/
│   │   ├── deploy.yaml            # Backend deployment manifest
│   │   └── service.yaml           # Backend service manifest
│   └── database/
│       ├── deploy.yaml            # Database deployment manifest
│       └── service.yaml           # Database service manifest
│
└── README.md
```

---

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

ตรวจสอบให้แน่ใจว่าติดตั้งทุก tool ครบก่อนรันโปรเจค

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ source code |
| Node.js | ≥ 18.x | JavaScript runtime |
| npm | ≥ 9.x | Package manager สำหรับ Node.js |
| Docker | ≥ 24.x | สร้างและรัน container |
| Docker Compose | ≥ 2.x | สำหรับ local development |
| Jenkins | ≥ 2.4xx | ระบบ CI/CD automation |
| Terraform | ≥ 1.x | Provision infrastructure |
| Ansible | ≥ 2.15 | Configure environment |
| kubectl | ≥ 1.28 | สั่งงาน Kubernetes cluster |
| Kind/Minikube | latest | Kubernetes แบบ local |
| PostgreSQL | ≥ 14 | Database server |
| Prometheus | ≥ 2.x | เก็บ metrics |
| Grafana | ≥ 10.x | แสดง dashboard |

---

## 🏃 วิธีรันโปรเจค (Quick Start)

### 1. Clone Repository
```bash
git clone https://github.com/Tomato-0212/daily-hub.git
cd daily-hub
```

### 2. รันแอปบนเครื่องโดยตรง (ไม่ผ่าน pipeline)

#### Frontend
```bash
cd app/frontend
# สามารถเปิดแอปด้วยการเปิด index.html ใน browser หรืออาจใช้ local server
# เช่น: python -m http.server 3000 (Python)
# หรือ: npx http-server -p 3000 (Node.js)
```

#### Backend
```bash
cd app/backend
npm install
npm run dev
# Backend รันที่ http://localhost:4000
```

#### Database (Docker Compose)
```bash
cd database
docker-compose up -d
# PostgreSQL รันที่ localhost:5432
```

### 3. Build และรันด้วย Docker

#### Frontend
```bash
docker build -t [dockerhub-username]/daily-standup-frontend:latest ./app/frontend
docker run -p 3000:3000 [dockerhub-username]/daily-standup-frontend:latest
```

#### Backend
```bash
docker build -t [dockerhub-username]/daily-standup-backend:latest ./app/backend
docker run -p 4000:4000 [dockerhub-username]/daily-standup-backend:latest
```

#### หรือใช้ Docker Compose สำหรับ local development
```bash
docker-compose -f app/docker-compose.yaml up -d
```

---

## 🔄 CI/CD Pipeline (Jenkins)

### ลำดับการทำงานของ Pipeline

```
Checkout ──▶ Terraform ──▶ Ansible ──▶ Parallel Build ──▶ Push to Hub ──▶ Parallel Deploy
```

| Stage | คำอธิบาย |
|-------|----------|
| **Checkout** | ดึงโค้ดล่าสุดจาก GitHub |
| **Terraform** | ช็ค VM state — สร้าง VM ถ้ายังไม่มี |
| **Ansible** | เช็ค Docker — ติดตั้ง Docker + K8s ถ้ายังไม่มี |
| **Build Frontend** | Build Docker image ของ Frontend (parallel) |
| **Build Backend** | Build Docker image ของ Backend (parallel) |
| **Push to Hub** | อัปโหลด images ขึ้น Docker Hub |
| **Deploy Frontend** | kubectl apply Frontend Kubernetes manifests |
| **Deploy Backend** | kubectl apply Backend Kubernetes manifests |

### วิธีตั้งค่า Jenkins
1. ติดตั้ง Jenkins และเปิดที่ `http://localhost:8080`
2. ติดตั้ง plugin: **Git**, **Pipeline**, **Docker Pipeline**
3. เพิ่ม credentials สำหรับ Docker Hub (ชื่อ `dockerhub-credentials`)
4. สร้าง Pipeline job ใหม่ และชี้ไปที่ repository นี้
5. ตั้งค่า Webhook ใน GitHub:
   - ไปที่ **Settings → Webhooks → Add webhook**
   - Payload URL: `http://[jenkins-host]:8080/github-webhook/`
   - Content type: `application/json`
   - ติ๊ก trigger: **Just the push event**

---

## 🏗️ Infrastructure as Code

### Terraform — Provision Infrastructure
```bash
cd terraform
terraform init      # ดาวน์โหลด provider plugins
terraform plan      # ตรวจสอบว่าจะสร้างอะไรบ้าง
terraform apply     # สร้าง resource จริง
```
> **สิ่งที่ Terraform สร้าง:** VM instance, Virtual Network, Security Groups และ resources อื่น ๆ ตามที่กำหนดใน `main.tf`

### Ansible — Configure Environment
```bash
cd ansible
ansible-playbook -i inventory/static.ini setup/docker.yaml
ansible-playbook -i inventory/static.ini setup/k8s-kind.yaml
```
> **สิ่งที่ Ansible ทำ:** ติดตั้ง Docker, Kubernetes (Kind), และ configure environment บน VM ที่ Terraform สร้างไว้

> ⚠️ **หมายเหตุ:** ใน pipeline จริง Jenkins จะเรียก Terraform และ Ansible อัตโนมัติในขั้นตอน Deploy ไม่ต้องรันด้วยมือ

---

## ☸️ Kubernetes Deployment

### Apply Manifests ด้วยตัวเอง
```bash
# สร้าง namespace
kubectl apply -f k8s/namespace.yaml

# Deploy database
kubectl apply -f k8s/database/deploy.yaml
kubectl apply -f k8s/database/service.yaml

# Deploy backend
kubectl apply -f k8s/backend/deploy.yaml
kubectl apply -f k8s/backend/service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend/deploy.yaml
kubectl apply -f k8s/frontend/service.yaml
```

### ตรวจสอบสถานะ
```bash
kubectl get pods -n standup-hub
kubectl get svc  -n standup-hub
kubectl get deployments -n standup-hub
```

### ผลลัพธ์ที่ควรจะได้
```
NAME                                      READY   STATUS    RESTARTS   AGE
daily-standup-frontend-xxxxxxxxx-xxxxx    1/1     Running   0          2m
daily-standup-backend-xxxxxxxxx-yyyyy     1/1     Running   0          2m
daily-standup-database-xxxxxxxxx-zzzzz    1/1     Running   0          2m

NAME                    TYPE       CLUSTER-IP     PORT(S)          AGE
daily-standup-hub-svc   NodePort   10.96.xx.xxx   3000:30000/TCP   2m
```

### เข้าถึงแอปพลิเคชัน
```
http://localhost:30000
```

---

## 📊 Monitoring

### Prometheus — เก็บ Metrics
- ไฟล์ config: `monitoring/prometheus.yml`
- Scrape ทุก **15 วินาที**
- Target endpoint: `http://[app-host]:[port]/metrics`

รัน Prometheus:
```bash
prometheus --config.file=monitoring/prometheus.yml
# เปิด UI ที่ http://localhost:9090
```

### Grafana — แสดง Dashboard
- ไฟล์ dashboard: `monitoring/grafana-dashboard.json`
- Data source: Prometheus (`http://localhost:9090`)

วิธี import dashboard:
1. เปิด Grafana ที่ `http://localhost:3000`
2. ไปที่ **Dashboards → Import**
3. อัปโหลดไฟล์ `grafana-dashboard.json`

### Panels ใน Dashboard

| Panel | Metric (PromQL) | แสดงข้อมูลอะไร |
|-------|-----------------|----------------|
| Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Error Rate | `rate(http_requests_total{status=~"5.."}[1m])` | จำนวน error 5xx ต่อวินาที |
| Latency (p95) | `histogram_quantile(0.95, ...)` | response time ที่ percentile 95 |
| Pod Health | `up{job="[app-name]"}` | service ขึ้นหรือล่ม (1/0) |

---

## 🌿 Branching Strategy

```
main        ──── โค้ดที่พร้อม production, protected branch
dev         ──── รวมโค้ดก่อน merge ขึ้น main
feature/*   ──── พัฒนา feature แต่ละอัน (เช่น feature/add-login)
```

| Branch | Protected | คำอธิบาย |
|--------|-----------|----------|
| `main` | ✅ | trigger pipeline อัตโนมัติเมื่อ merge |
| `dev` | ✅ | ทดสอบก่อน merge ขึ้น main |
| `feature/*` | ❌ | พัฒนาแยกกันแล้วค่อย merge เข้า dev |

---

## 🧪 API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `GET` | `/` | Health check — ตรวจว่าแอปยังรันอยู่ |
| `GET` | `/metrics` | Prometheus metrics endpoint |
| `GET` | `/tasks` | ดึง standup ทั้งหมด |
| `POST` | `/tasks` | บันทึก standup ใหม่ |
| `PUT` | `/tasks/:id` | แก้ไข standup ตาม id |
| `DELETE` | `/tasks/:id` | ลบ standup ตาม id |

---

## 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

**Pods ค้างอยู่ที่ `Pending` ไม่ยอม Running**
```bash
kubectl describe pod [pod-name] -n [namespace]
# ดูที่ Events: อาจเกิดจาก resource ไม่พอ หรือ image pull error
```

**Jenkins pipeline ล้มเหลวตอน Docker Build**
```bash
# ตรวจว่า Docker daemon รันอยู่
sudo systemctl start docker
# เพิ่ม jenkins user เข้า docker group
sudo usermod -aG docker jenkins
```

**Prometheus แสดง target เป็น DOWN**
```bash
# ตรวจว่าแอปเปิด /metrics ได้จริง
curl http://localhost:4000/metrics
# ตรวจสอบ prometheus.yml ว่า host:port ตรงกับแอปจริง
```

**Backend error เมื่อ Connect Database**
```bash
# ตรวจว่า PostgreSQL รันอยู่
docker-compose ps
# ตรวจค่า environment variables ใน deployment.yaml และ server.js
```

---

## 📚 เอกสารอ้างอิง

- [Jenkinsfile Declarative Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown Syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
