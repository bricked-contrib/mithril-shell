{
  gnome-control-center,
  readPatches,
}:
gnome-control-center.overrideAttrs (old: {
  pname = "mithril-control-center";

  patches = old.patches ++ (readPatches ./.);

  preFixup = ''
    for i in $out/share/applications/*; do
      substituteInPlace $i --replace-warn "Exec=gnome-control-center" "Exec=mithril-control-center"
    done
    mv $out/bin/gnome-control-center $out/bin/mithril-control-center

    ${old.preFixup}
  '';

  doCheck = false;

  meta.mainProgram = "mithril-control-center";
})
