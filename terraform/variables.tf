variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for the web server"
  type        = string
  default     = "t3.micro"
}

variable "app_name" {
  description = "The name of the application and infrastructure resources"
  type        = string
  default     = "grocery-app"
}

variable "allowed_cidr" {
  description = "CIDR block allowed to access the web server"
  type        = string
  default     = "0.0.0.0/0"
}

variable "aws_access_key" {
  description = "AWS access key for Terraform"
  type        = string
  sensitive   = true
  default     = null
}

variable "aws_secret_key" {
  description = "AWS secret key for Terraform"
  type        = string
  sensitive   = true
  default     = null
}
