{
  ags,
  bun,
  sassc,
  writeShellApplication,

  agsConfig ? ../../ags,
}:
writeShellApplication rec {
  name = "mithril-shell";

  runtimeInputs = [
    ags
    bun
    sassc
  ];

  text = ''
    exec ags -c ${agsConfig}/config.js "$@"
  '';

  derivationArgs.passthru.packages = runtimeInputs;
}
