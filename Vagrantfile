# -*- mode: ruby -*-
# vi: set ft=ruby :

BOX_NAME = ENV['BOX_NAME'] || "ubuntu/focal64"
SSH_PRIVKEY_PATH = ENV["SSH_PRIVKEY_PATH"]
NODE_MAJOR_VERSION = "14"

$script = <<SCRIPT
user="$1"
if [ -z "$user" ]; then
    user=vagrant
fi

apt-get update -q

apt-get install -yq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https

curl -sL https://deb.nodesource.com/setup_#{NODE_MAJOR_VERSION}.x | sudo -E bash -

apt-get install -yq \
  gcc \
  g++ \
  make \
  python-is-python3 \
  nodejs

mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -q
apt-get install -yq \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  linux-image-extra-virtual

grep -q docker /etc/group || groupadd docker
usermod -a -G docker vagrant

systemctl start docker

docker image pull ubuntu

printf "#"'!'"/bin/bash\ndocker rm -f "'$'"(docker ps -a -q)" > /usr/bin/clearcontainers
chmod +x /usr/bin/clearcontainers

SCRIPT

Vagrant::Config.run do |config|
  config.vm.box = BOX_NAME

  if SSH_PRIVKEY_PATH
      config.ssh.private_key_path = SSH_PRIVKEY_PATH
  end

  config.ssh.forward_agent = true
end

Vagrant::VERSION >= "1.1.0" and Vagrant.configure("2") do |config|
  config.vm.provider :virtualbox do |vb, override|
    override.vm.provision :shell, :run => :once, :inline => $script
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
  end
end
