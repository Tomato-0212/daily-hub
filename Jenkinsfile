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

        // Path in project
        // Application Path
        FRONTEND_PATH = 'app/frontend/'
        BACKEND_PATH = 'app/backend/'
        TERRAFORM_PATH = 'terraform/'
        ANSIBLE_PATH = 'ansible/setup/'

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
        stage('Infra: Terraform Plan & Apply') {
            agent { label 'infra-ops' }
            dir("${env.TERRAFORM_PATH}") {
                steps {
                    echo 'Running Terraform Plan...'
                    // Add your Terraform plan commands here
                    echo 'Running Terraform Apply...'
                    // Add your Terraform apply commands here
                }
            }
        }
        stage('Infra: Ansible Configuration') {
            agent { label 'infra-ops' }
            dir("${env.ANSIBLE_PATH}") {
                steps {
                    echo 'Running Ansible Playbook...'
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
                            sleep 10
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
                            sleep 10
                        }

                        // Test Docker Image
                        sh 'docker images | grep $BE_IMAGE'
                    }
                }
            }
        }
    }

}


