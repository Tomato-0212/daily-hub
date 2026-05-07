terraform {
    required_version = ">= 1.0"
    cloud {
        organization = "cloud-project-01"

        workspaces {
          name = "my-project-cloud"
        }
    }
}