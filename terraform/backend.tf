terraform {
    required_version = "1.14.9"
    cloud {
        organization = "cloud-project-01"

        workspaces {
          name = "my-project-cloud"
        }
    }
}