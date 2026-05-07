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

  # Add Username for Ansible access
  user_data = <<-EOF
    #!/bin/bash
    # 1. Create a new user
    useradd -m -s /bin/bash ${var.admin_username}

    # 2. Add the user to the sudo group
    echo "${var.admin_username} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/${var.admin_username}

    # 3. Set up SSH access for the new user
    mkdir -p /home/${var.admin_username}/.ssh
    cp /root/.ssh/authorized_keys /home/${var.admin_username}/.ssh/authorized_keys
    
    # 4. Set proper permissions
    chown -R ${var.admin_username}:${var.admin_username} /home/${var.admin_username}/.ssh
    chmod 700 /home/${var.admin_username}/.ssh
    chmod 600 /home/${var.admin_username}/.ssh/authorized_keys
  EOF

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

# สร้างไฟล์ inventory สำหรับ Ansible โดยใช้ข้อมูลจาก Droplet ที่สร้างขึ้น
/*resource "local_file" "ansible_inventory" {
  content = <<EOT
[vm_app_node]
%{for index, ip in digitalocean_droplet.cloud-project[*].ipv4_address~}
app_server_${index + 1} ansible_host=${ip} ansible_ssh_private_key_file="${var.pvt_key_path}" ansible_user="${var.admin_username}"
%{endfor~}
EOT

  filename = "${path.module}/../ansible/inventory/terraform.ini"
}*/
