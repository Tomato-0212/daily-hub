output "droplet_id" {
    description = "ID of the created DigitalOcean Droplet"
    value       = digitalocean_droplet.cloud-project.id
}

output "droplet_ipv4_address" {
    description = "Public IPv4 address of the created DigitalOcean Droplet"
    value       = digitalocean_droplet.cloud-project.ipv4_address
}

output "droplet_status" {
    description = "Current status of the created DigitalOcean Droplet"
    value       = digitalocean_droplet.cloud-project.status
}

output "droplet_name" {
    description = "Name of the created DigitalOcean Droplet"
    value       = digitalocean_droplet.cloud-project.name
}