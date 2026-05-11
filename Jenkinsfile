pipeline {
    agent none

    environment {
        // Docker
        DOCKER_USERNAME = 'worawut2547'
        DOCKER_REPO = 'cloud-project'

        FE_IMAGE = 'daily-hub-fe'
        BE_IMAGE = 'daily-hub-be'

        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        

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

        // ============= INFRA-OPS STAGE =============
        stage('Infra: Terraform Init, Plan, Apply') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.TERRAFORM_PATH}") {
                    sh '''
                        echo 'Initializing Terraform...'
                        terraform init

                        echo 'Running Terraform Plan...'
                        terraform plan -out=tfplan

                        # Save status for later use
                        if terraform show tfplan | grep -q "No changes"; then
                            echo "NO_CHANGES=true" > /tmp/tf_status
                        else
                            echo "NO_CHANGES=false" > /tmp/tf_status
                        fi
                    '''

                    script {
                        def status = readFile('/tmp/tf_status').trim().split('=')[1]
                        if (status == 'true') {
                            echo '✓ Skipping apply - no changes'
                        } else {
                            echo 'Running Terraform Apply...'
                            sh 'terraform apply -auto-approve tfplan'
                        }
                    }

                    /*echo 'Initializing Terraform...'
                    sh 'terraform init'

                    echo 'Running Terraform Plan...'
                    sh 'terraform plan -out=tfplan'

                    echo 'Running Terraform Apply...'
                    sh 'terraform apply -auto-approve tfplan'*/
                }
            }
        }
        
        stage('Infra: Ansible Health Check') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    echo 'Running Ansible Health Check...'
                    // Add your Ansible health check commands here
                    sh 'ansible all -i inventory/static.ini -a "uptime"'
                    sleep 5
                }
            }
        }

        stage('Infra: Ansible Setup') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    // Check Docker
                    def dockerExists = sh(
                        script: 'docker ps -a | grep -q "kind-"',
                        returnStatus: true
                    ) == 0

                    // Check K8s
                    def k8sExists = sh(
                        script: 'kubectl cluster-info &> /dev/null',
                        returnStatus: true
                    ) == 0

                    if (!dockerExists) {
                        echo 'Docker not found. Running Ansible Setup for Docker...'
                        sh 'ansible-playbook -i inventory/static.ini setup/docker.yaml'
                        sleep 10
                    } else {
                        echo '✓ Docker is already set up. Skipping Docker setup.'
                    }

                    if (!k8sExists) {
                        echo 'Kubernetes cluster not found. Running Ansible Setup for Kubernetes...'
                        sh 'ansible-playbook -i inventory/static.ini setup/k8s-kind.yaml'
                        sleep 10
                    } else {
                        echo '✓ Kubernetes cluster is already set up. Skipping Kubernetes setup.'
                    }  

                    /*echo 'Running Ansible Setup...'
                    // Add your Ansible playbook commands here\
                    sh 'ansible-playbook -i inventory/static.ini setup/docker.yaml'
                    //sleep 10

                    sh 'ansible-playbook -i inventory/static.ini setup/k8s-kind.yaml'
                    //sleep 10*/
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
                            sh "docker build -t $FE_IMAGE:$IMAGE_TAG ."
                        }
                    }
                }
                stage('Build Backend') {
                    agent { label 'build-be' }
                    steps {
                        checkout scm
                        echo 'Building Backend...'
                        // Add your build commands for the backend here
                        dir("${env.BACKEND_PATH}") {
                            sh "docker build -t $BE_IMAGE:$IMAGE_TAG ."
                        }
                    }
                }
            }
        }
        
        // ============= DOCKER PUSH STAGE =============
        stage('Push to Docker Hub') {
            agent { label 'wsl-node' }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-token',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    echo 'Logging in to Docker Hub...'
                    sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --password-stdin"
                    sleep 5

                    // Change Tag
                    echo 'Changing Docker Image Tags...'
                    // Frontend
                    sh "docker tag $FE_IMAGE:$IMAGE_TAG $DOCKER_USER/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG"
                    // Backend
                    sh "docker tag $BE_IMAGE:$IMAGE_TAG $DOCKER_USER/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG"

                    // Push to Docker Hub
                    echo 'Pushing Frontend Image to Docker Hub...'
                    sh "docker push $DOCKER_USER/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG"

                    echo 'Pushing Backend Image to Docker Hub...'
                    sh "docker push $DOCKER_USER/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG"
                }
            }
        }

        // ============ DEPLOY TO K8S STAGE =============
        stage('Infra: Ansible Delivery - k8s') {
            agent { label 'infra-ops' }
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    echo 'Running Ansible Delivery...'
                    // Add your Ansible playbook commands here
                    sh """
                        ansible-playbook -i inventory/static.ini \
                        delivery/k8s-deploy.yaml \
                        -e "image_tag=$IMAGE_TAG"
                    """
                }
            }
        }

        // ============= CLEANUP STAGE =============
        stage('Cleanup') {
            agent { label 'wsl-node' }
            steps {
                echo 'Cleaning up local Docker images...'

                sh "docker rmi $DOCKER_USERNAME/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG || true"
                sh "docker rmi $DOCKER_USERNAME/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG || true"

                sh "docker rmi -f $FE_IMAGE:$IMAGE_TAG || true"
                sh "docker rmi -f $BE_IMAGE:$IMAGE_TAG || true"

                sh "docker images | grep $FE_IMAGE-$IMAGE_TAG || echo \"No local image for $FE_IMAGE-$IMAGE_TAG\""
                sh "docker images | grep $BE_IMAGE-$IMAGE_TAG || echo \"No local image for $BE_IMAGE-$IMAGE_TAG\""

                sh "docker logout"
            }
        }
    }

}


