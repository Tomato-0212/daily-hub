pipeline {
    agent none

    environment {
        // Docker
        DOCKER_USERNAME = 'worawut2547'
        DOCKER_REPO = 'cloud-project'

        FE_IMAGE = 'daily-hub-fe'
        BE_IMAGE = 'daily-hub-be'
        

        FE_CONTAINER = 'daily-hub-fe-container'
        BE_CONTAINER = 'daily-hub-be-container'

        // Github
        GITHUB_REPO = 'daily-hub'

        // Terraform
        TF_VAR_do_api_token = credentials('do-api-token')
        TF_VAR_project_id = credentials('do-project-id')
        TF_VAR_admin_username = credentials('do-admin-username')

        // SSH Key for Terraform
        TF_VAR_ssh_key_id = credentials('do-ssh-key-id') // SSH_PUBLIC_KEYPATH
        TF_VAR_pvt_key_path = credentials('do-pvt-key-path') // SSH_PRIVATE_KEYPATH

        // Path in project
        // SSH Key Path
        SSH_PUBLIC_KEYPATH = '~/jenkins-agent/.ssh/cloud-project/do_vm_app.pub'
        SSH_PRIVATE_KEYPATH = '~/jenkins-agent/.ssh/cloud-project/do_vm_app'

        // Application Path
        FRONTEND_PATH = 'app/frontend/'
        BACKEND_PATH = 'app/backend/'
        TERRAFORM_PATH = 'terraform/'

        // Ansible Path
        ANSIBLE_PATH = 'ansible'

        // IP Server
    }

    stages {
        // ============= CHECKOUT STAGE =============
        stage('Checkout') {
            agent { label 'wsl-node' }
            steps {
                cleanWs()
                withCredentials([usernamePassword(credentialsId: 'github-token',
                    usernameVariable: 'GITHUB_USERNAME', 
                    passwordVariable: 'GITHUB_PASSWORD'
                )]) {
                    echo 'Checking out code from GitHub...'

                    // ดึงโค้ดจาก Github
                    sh 'git clone https://$GITHUB_USERNAME:$GITHUB_PASSWORD@github.com/$GITHUB_USERNAME/$GITHUB_REPO.git'
                }
            }
        }
        stage('Debug Variable Name') {
            agent { label 'infra-ops' }
            steps {
                // คำสั่งนี้จะเช็คว่ามีตัวแปรที่ชื่อขึ้นต้นด้วย TF_VAR หรือไม่ 
                // โดยไม่แสดงค่า Secret ออกมา (เพื่อความปลอดภัย)
                sh 'env | grep TF_VAR | cut -d= -f1'
            }
        }
        // ============= INFRA-OPS STAGE =============
        stage('Infra: Terraform Init, Plan, Apply') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.TERRAFORM_PATH}") {
                    echo 'Initializing Terraform...'
                    sh 'terraform init'
                    sleep 5

                    echo 'Running Terraform Plan...'
                    sh 'terraform plan -out=tfplan'
                    sleep 5

                    echo 'Running Terraform Apply...'
                    sh 'terraform apply -auto-approve tfplan'
                    // เผื่อเวลาให้ user_data ในการสร้าง User และตั้งค่า SSH ก่อน
                    // echo "Waiting 120 seconds for Cloud-init (user setup) to finish..."
                    sleep 5
                }
            }
        }
        
        stage('Infra: Ansible Health Check') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    echo 'Running Ansible Health Check...'
                    sh 'cat inventory/static.ini'
                    sleep 5
                    // Add your Ansible health check commands here
                    sh 'ansible all -i inventory/static.ini -a "uptime"'
                    sleep 5

                    sh 'ansible all -i inventory/static.ini -m ping'
                }
            }
        }
        stage('Infra: Ansible Setup') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    
                    echo 'Running Ansible Setup...'
                    // Add your Ansible playbook commands here\
                    sh 'ansible-playbook -i inventory/static.ini setup/docker.yaml'
                    sleep 10

                    sh 'ansible-playbook -i inventory/static.ini setup/k8s-kind.yaml'
                    sleep 10

                    echo 'Check Kubernetes cluster status...'
                    //sh 'ansible all -i inventory/static.ini -a "kubectl cluster-info"'
                }
            }
        }

        stage('Infra: Ansible Configuration') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    sh 'pwd && ls -a'
                    echo 'Running Ansible Configuration...'
                    // Add your Ansible playbook commands here
                }
            }
        }

        // ============= BUILD STAGE PARALLEL =============
        stage('Build Parallel') {
            parallel {
                stage('Build Frontend') {
                    agent { label 'build-fe' }
                    steps {
                        checkout scm
                        echo 'Building Frontend...'
                        // Add your build commands for the frontend here
                        dir("${env.FRONTEND_PATH}") {
                            sh 'pwd && ls -a'
                            sh 'docker build -t $FE_IMAGE:latest .'
                            sleep 5
                        }

                        // Test Docker Image
                        sh 'docker images | grep $FE_IMAGE'
                    }
                }
                stage('Build Backend') {
                    agent { label 'build-be' }
                    steps {
                        checkout scm
                        echo 'Building Backend...'
                        // Add your build commands for the backend here
                        dir("${env.BACKEND_PATH}") {
                            sh 'pwd && ls -a'
                            sh 'docker build -t $BE_IMAGE:latest .'
                            sleep 5
                        }

                        // Test Docker Image
                        sh 'docker images | grep $BE_IMAGE'
                    }
                }
            }
        }
        
        // ============= DOCKER PUSH STAGE =============
        stage('Push to Docker Hub') {
            agent { label 'wsl-node' }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-jenkins-token',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    echo 'Logging in to Docker Hub...'
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --password-stdin'
                    sleep 5

                    // Change Tag
                    echo 'Changing Docker Image Tags...'
                    // Frontend
                    sh 'docker tag $FE_IMAGE $DOCKER_USER/DOCKER_REPO:$FE_IMAGE'
                    // Backend
                    sh 'docker tag $BE_IMAGE $DOCKER_USER/DOCKER_REPO:$BE_IMAGE'
                    
                    // Push to Docker Hub
                    echo 'Pushing Frontend Image to Docker Hub...'
                    sh 'docker push $DOCKER_USER/DOCKER_REPO:$FE_IMAGE'
                    sleep 5

                    echo 'Pushing Backend Image to Docker Hub...'
                    sh 'docker push $DOCKER_USER/DOCKER_REPO:$BE_IMAGE'
                    sleep 5
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                echo 'Cleaning up local Docker images...'
                sh 'docker rmi $FE_IMAGE || true'
                sh 'docker rmi $BE_IMAGE || true'

                sh 'docker rmi $DOCKER_USER/DOCKER_REPO:$FE_IMAGE || true'
                sh 'docker rmi $DOCKER_USER/DOCKER_REPO:$BE_IMAGE || true'

                sh 'docker images | grep $FE_IMAGE || echo "No local image for $FE_IMAGE"'
                sh 'docker images | grep $BE_IMAGE || echo "No local image for $BE_IMAGE"'

                sh 'docker logout'
            }
        }
    }

}


