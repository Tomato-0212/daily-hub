# Create DigitalOcean Droplet
resource "digitalocean_droplet" "cloud-project" {
  name       = var.vm_name
  region     = var.region
  size       = var.droplet_size
  image      = var.os_image
  backups    = false
  monitoring = var.enable_monitoring

  # Use SSH keys for secure access if available, otherwise password auth
  ssh_keys = [var.ssh_key_id]

  lifecycle {
    ignore_changes = [image]
  }
}

# Assign the Droplet to the DigitalOcean Project
resource "digitalocean_project_resources" "droplet" {
  project = var.project_id
  resources = [
    digitalocean_droplet.cloud-project.urn
  ]
}
