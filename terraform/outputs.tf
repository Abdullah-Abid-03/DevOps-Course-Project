output "ecr_repository_url" {
  description = "ECR repository URL for the grocery app image"
  value       = aws_ecr_repository.app.repository_url
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 web server"
  value       = aws_instance.web.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 web server"
  value       = aws_instance.web.public_dns
}

output "web_url" {
  description = "Public HTTP URL for the deployed app"
  value       = "http://${aws_instance.web.public_dns}"
}
