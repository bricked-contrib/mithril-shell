{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    {
      homeModules.default = import ./modules/home-manager.nix;
    }
    // flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        formatter = pkgs.nixfmt-rfc-style;

        packages = import ./pkgs {
          inherit pkgs;
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            ags
            sass
            sassc
            typescript-language-server
            vscode-langservers-extracted
            bun
          ];

          shellHook = ''
            # This assumes the only flake.nix file in the project is in the root directory.
            if test -f flake.nix; then
              # Link the generates ags types in order to get better LSP support.
              ln -sf "$(dirname $(which ags))/../share/com.github.Aylur.ags/types" ags/
            fi
          '';
        };
      }
    );
}
