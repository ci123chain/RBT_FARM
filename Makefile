Tag?=v0.0.1
release:

release-build:
 docker build -f Dockerfile -t deploy-vault:$(Tag) .