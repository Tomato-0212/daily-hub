variable "do_api_token" {
  description = "DigitalOcean API token for authentication"
  type        = string
  sensitive   = true
  # Pass via environment variable: TF_VAR_do_api_token or terraform.tfvars
}

variable "vm_name" {
  description = "Name of the virtual machine to be created"
  type        = string
  default     = "daily-hub-vm"
}

variable "droplet_size" {
  description = "Size of the DigitalOcean Droplet (e.g., s-1vcpu-1gb)"
  type        = string
  default     = "s-1vcpu-512mb-10gb"
  # Others: s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-2vcpu-4gb, etc.
}

variable "region" {
  description = "Region where the Droplet will be created (e.g., nyc3)"
  type        = string
  default     = "sgp1"
  # Others: nyc3, sfo2, ams3, sgp1, fra1, tor1
}

variable "os_image" {
  description = "Image to use for the Droplet (e.g., ubuntu-22-04-x64)"
  type        = string
  default     = "ubuntu-22-04-x64"
  # Others: ubuntu-20-04-x64, debian-10-x64, centos-8-x64, etc.
}

variable "ssh_key_id" {
  description = "SSH key ID to be added to the Droplet for access"
  type        = string
  default     = null
  # Get SSH key ID: https://cloud.digitalocean.com/settings/security
}

variable "enable_monitoring" {
  description = "Whether to enable monitoring on the Droplet"
  type        = bool
  default     = true
}

variable "project_id" {
  description = "DigitalOcean Project ID to assign the Droplet to"
  type        = string
  # Get your project ID from: https://cloud.digitalocean.com/projects
}

variable "pvt_key_path" {
  description = "Path to the private SSH key for Ansible access"
  type        = string
  default     = "~/.ssh/id_rsa"
}

variable "admin_username" {
    description = "Username to be created and used by Ansible"
    type        = string
    default     = "worawut"
}
