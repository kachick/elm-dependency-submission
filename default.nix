{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/23.05.tar.gz") { } }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs-16_x
    pkgs.dprint
    pkgs.cargo-make
    pkgs.nil
    pkgs.nixpkgs-fmt
    pkgs.typos
  ];
}
