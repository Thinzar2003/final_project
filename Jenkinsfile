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
            defaultValue: 'http://192.168.56.102:5000',
            description: 'API host URL for frontend to connect to.'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code..."
                    checkout scm
                    echo "Deploying to production environment"
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
                        // Create .env file for Docker Compose
                        sh """
                            cat > .env <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
MYSQL_DATABASE=restaurant_db
MYSQL_USER=user
MYSQL_PASSWORD=${MYSQL_PASS}
MYSQL_PORT=3306
DB_PORT=3306

PHPMYADMIN_PORT=8888

API_PORT=5000
PORT=5000

FRONTEND_PORT=3000
API_HOST=${params.API_HOST}
EOF
                        """
                    }

                    echo "Environment configuration created"
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
                    sh 'sleep 20'   // give MySQL a bit more time

                    echo "Performing health check..."

                    sh """
                        # Show running containers
                        docker compose ps

                        echo "Waiting for API /health endpoint..."

                        # Retry up to 90 seconds until API responds (200 OK)
                        timeout 90 bash -c '
                          while true; do
                            STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health || echo "000")
                            echo "Health status: \$STATUS_CODE"
                            if [ "\$STATUS_CODE" = "200" ]; then
                              echo "API is healthy!"
                              break
                            fi
                            echo "API not healthy yet, retrying in 5s..."
                            sleep 5
                          done
                        '

                        echo "Checking /restaurants endpoint..."
                        curl -f http://localhost:5000/restaurants

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
                        echo "Frontend: http://localhost:3000"
                        echo "API: http://localhost:5000"
                        echo "phpMyAdmin: http://localhost:8888"
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                echo "✅ Deployment completed successfully!"
                echo "Build: ${BUILD_TAG}"
                echo "Commit: ${GIT_COMMIT_SHORT}"
                echo ""
                echo "Access your application:"
                echo "  - Frontend: http://localhost:3000"
                echo "  - API: http://localhost:5000"
                echo "  - phpMyAdmin: http://localhost:8888"
            }
        }

        failure {
            script {
                echo "❌ Deployment failed!"
                echo "Printing container logs for debugging..."
                sh 'docker compose logs --tail=50 || true'
            }
        }

        always {
            script {
                echo "Cleaning up old Docker resources..."
                sh """
                    # Remove dangling images
                    docker image prune -f

                    # Remove old containers
                    docker container prune -f
                """
            }
        }
    }
}
