{
  pkgs,
  gnome-control-center ? pkgs.gnome-control-center,
  ...
}:
let
  lib = pkgs.lib;
  patches = lib.pipe (builtins.readDir ./.) [
    (lib.filterAttrs (_: type: type == "regular"))
    (lib.filterAttrs (name: _: lib.hasSuffix ".patch" name))
    (lib.mapAttrsToList (name: _: ./. + ("/" + name)))
  ];
in
gnome-control-center.overrideAttrs (old: {
  pname = "mithril-control-center";

  patches = old.patches ++ patches;

  postFixup = ''
    rm $out/share/applications/gnome-*-panel.desktop 
    for i in $out/share/applications/*; do
      substituteInPlace $i --replace "Exec=$out/bin/gnome-control-center" "Exec=$out/bin/mithril-control-center"
    done
    mv $out/bin/gnome-control-center $out/bin/mithril-control-center
  '';

  doCheck = false;

  meta.mainProgram = "mithril-control-center";
})
