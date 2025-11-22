pipeline {
    agent any

    triggers {
        // Poll SCM as fallback if webhook fails
        pollSCM('H/2 * * * *')
    }

    environment {
        // Build Information
        BUILD_TAG = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
    }

    parameters {
        booleanParam(
            name: 'CLEAN_VOLUMES',
            defaultValue: true,
            description: 'Remove volumes (clears database)'
        )
        string(
            name: 'API_HOST',
            defaultValue: 'http://192.168.56.102:5000',   // 👈 your VM IP + API port
            description: 'API host URL for frontend to connect to.'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code..."
                    checkout scm
                    echo "Deploying Restaurant project"
                    echo "Build: ${BUILD_TAG}, Commit: ${GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Validate') {
            steps {
                script {
                    echo "Validating Docker Compose configuration..."
                    sh 'docker compose config'
                }
            }
        }

        stage('Prepare Environment') {
            steps {
                script {
                    echo "Preparing environment configuration..."

                    // Load credentials from Jenkins
                    withCredentials([
                        string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASS'),
                        string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASS')
                    ]) {
                        // Create .env file that Docker Compose will use
                        sh """
                            cat > .env <<EOF
# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
MYSQL_DATABASE=restaurant_db
MYSQL_USER=user
MYSQL_PASSWORD=${MYSQL_PASS}
MYSQL_PORT=3306
DB_PORT=3306

# phpMyAdmin Configuration
PHPMYADMIN_PORT=8888

# API Configuration
API_PORT=5000
PORT=5000

# Frontend Configuration
FRONTEND_PORT=3000
NODE_ENV=production
API_HOST=${params.API_HOST}
EOF
                        """
                    }

                    echo "Environment configuration created (.env)"
                    sh 'echo ".env file created successfully"'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying to production using Docker Compose..."

                    // Stop existing containers
                    def downCommand = 'docker compose down'
                    if (params.CLEAN_VOLUMES) {
                        echo "WARNING: Removing volumes (database will be cleared)"
                        downCommand = 'docker compose down -v'
                    }
                    sh downCommand

                    // Build and start services
                    sh """
                        docker compose build --no-cache
                        docker compose up -d
                    """

                    echo "Deployment completed"
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for services to start..."
                    sh 'sleep 15'

                    echo "Performing health check..."

                    sh """
                        # Check if containers are running
                        docker compose ps

                        # Wait for API to be ready (max 60 seconds)
                        timeout 60 bash -c 'until curl -f http://localhost:5000/health; do sleep 2; done' || exit 1

                        # Check restaurants endpoint
                        curl -f http://localhost:5000/restaurants || exit 1

                        echo "Health check passed!"
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "Verifying all services..."

                    sh """
                        echo "=== Container Status ==="
                        docker compose ps

                        echo ""
                        echo "=== Service Logs (last 20 lines) ==="
                        docker compose logs --tail=20

                        echo ""
                        echo "=== Deployed Services ==="
                        echo "Frontend:  http://localhost:3000"
                        echo "API:       http://localhost:5000"
                        echo "phpMyAdmin: http://localhost:8888"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Restaurant deployment completed successfully!"
            echo "Build: ${BUILD_TAG}"
            echo "Commit: ${GIT_COMMIT_SHORT}"
            echo ""
            echo "Access your application:"
            echo "  - Frontend:  http://localhost:3000"
            echo "  - API:       http://localhost:5000"
            echo "  - phpMyAdmin: http://localhost:8888"
        }
